import { Transaction } from '../model/Transaction';
import { Account } from '../model/Account';
import { Currency } from '../model/Currency';
import { Types } from 'mongoose';
import logger from '../utils/logger';
import { getExchangeRate, convertCurrency } from './currencyService';

export const getAllTransactions = async (userId: Types.ObjectId) => {
    try {
        const accounts = await Account.find({ userId }).select('_id');
        const accountIds = accounts.map((acc) => acc._id);
        return await Transaction.find({
            $or: [{ fromAccount: { $in: accountIds } }, { toAccount: { $in: accountIds } }],
        })
            .populate({
                path: 'fromAccount',
                populate: { path: 'currency' },
            })
            .populate({
                path: 'toAccount',
                populate: { path: 'currency' },
            })
            .populate('currencyFrom')
            .populate('currencyTo')
            .populate('category');
    } catch (error) {
        logger.error(error);
        throw error;
    }
};

export const getTransactionById = async (transactionId: string) => {
    try {
        return await Transaction.findById(transactionId)
            .populate({
                path: 'fromAccount',
                populate: { path: 'currency' },
            })
            .populate({
                path: 'toAccount',
                populate: { path: 'currency' },
            })
            .populate('currencyFrom')
            .populate('currencyTo')
            .populate('category');
    } catch (error) {
        logger.error(error);
        throw error;
    }
};

export const createTransaction = async (transactionData: { fromAccountId: string; toAccountId: string; amount: number; currencyFrom: string; categoryId: string }) => {
    try {
        const [fromAccount, toAccount] = await Promise.all([Account.findById(transactionData.fromAccountId), Account.findById(transactionData.toAccountId)]);

        if (!fromAccount || !toAccount) {
            throw new Error('One or both accounts not found');
        }

        const sourceCurrency = await Currency.findById(fromAccount.currency);
        const targetCurrency = await Currency.findById(toAccount.currency);
        if (!sourceCurrency || !targetCurrency) {
            throw new Error('One or both currencies not found');
        }

        let deductedAmount = transactionData.amount;
        if (transactionData.currencyFrom.toLowerCase() !== sourceCurrency.code.toLowerCase()) {
            deductedAmount = await convertCurrency(transactionData.currencyFrom, sourceCurrency.code, transactionData.amount.toString());
        }

        if (fromAccount.balance < deductedAmount) {
            throw new Error('Insufficient funds');
        }

        const currencyFromDoc = await Currency.findOne({ code: transactionData.currencyFrom.toUpperCase() });
        if (!currencyFromDoc) {
            throw new Error('currencyFrom not found');
        }
        const exchangeRate = await getExchangeRate(currencyFromDoc._id as string, targetCurrency._id as string);

        const transaction = new Transaction({
            fromAccount: fromAccount._id,
            toAccount: toAccount._id,
            amount: transactionData.amount,
            currencyFrom: currencyFromDoc._id,
            currencyTo: targetCurrency._id,
            exchangeRate: exchangeRate,
            category: transactionData.categoryId,
            timestamp: new Date(),
            status: 'pending',
        });

        fromAccount.balance -= deductedAmount;
        fromAccount.pending += deductedAmount;

        await Promise.all([fromAccount.save(), transaction.save()]);
        return transaction;
    } catch (error) {
        logger.error(error);
        throw error;
    }
};

export const updateTransactionById = async (transactionId: string, updateData: { amount?: number; categoryId?: string }) => {
    try {
        const transaction = await Transaction.findById(transactionId);
        if (!transaction) {
            throw new Error('Transaction not found');
        }
        if (transaction.status !== 'pending') {
            throw new Error('Cannot update processed transaction');
        }

        const fromAccount = await Account.findById(transaction.fromAccount);
        if (!fromAccount) {
            throw new Error('From account not found');
        }
        const sourceCurrency = await Currency.findById(fromAccount.currency);
        const currencyFrom = await Currency.findById(transaction.currencyFrom);
        if (!sourceCurrency || !currencyFrom) {
            throw new Error('One or both currencies not found');
        }

        if (updateData.amount) {
            let oldDeductedAmount = transaction.amount;
            if (currencyFrom.code !== sourceCurrency.code) {
                oldDeductedAmount = await convertCurrency(currencyFrom.code, sourceCurrency.code, transaction.amount.toString());
            }
            fromAccount.pending -= oldDeductedAmount;
            fromAccount.balance += oldDeductedAmount;

            const newAmount = updateData.amount;
            let newDeductedAmount = newAmount;
            if (currencyFrom.code !== sourceCurrency.code) {
                newDeductedAmount = await convertCurrency(currencyFrom.code, sourceCurrency.code, newAmount.toString());
            }
            if (fromAccount.balance < newDeductedAmount) {
                fromAccount.pending += oldDeductedAmount;
                fromAccount.balance -= oldDeductedAmount;
                throw new Error('Insufficient funds');
            }
            fromAccount.balance -= newDeductedAmount;
            fromAccount.pending += newDeductedAmount;

            transaction.amount = newAmount;
            await fromAccount.save();
        }

        if (updateData.categoryId) {
            transaction.category = new Types.ObjectId(updateData.categoryId);
        }

        return await transaction.save();
    } catch (error) {
        logger.error(error);
        throw error;
    }
};

export const deleteTransactionById = async (transactionId: string) => {
    try {
        const transaction = await Transaction.findById(transactionId);
        if (!transaction) {
            throw new Error('Transaction not found');
        }
        if (transaction.status !== 'pending') {
            throw new Error('Cannot delete processed transaction');
        }

        const fromAccount = await Account.findById(transaction.fromAccount);
        if (!fromAccount) {
            throw new Error('From account not found');
        }
        const sourceCurrency = await Currency.findById(fromAccount.currency);
        const currencyFrom = await Currency.findById(transaction.currencyFrom);

        if (!sourceCurrency || !currencyFrom) {
            throw new Error('One or both currencies not found');
        }

        let deductedAmount = transaction.amount;
        if (currencyFrom.code !== sourceCurrency.code) {
            deductedAmount = await convertCurrency(currencyFrom.code, sourceCurrency.code, transaction.amount.toString());
        }
        fromAccount.pending -= deductedAmount;
        fromAccount.balance += deductedAmount;

        await Promise.all([fromAccount.save(), Transaction.findByIdAndDelete(transactionId)]);
    } catch (error) {
        logger.error(error);
        throw error;
    }
};
