import { Transaction } from '../model/Transaction';
import { Account } from '../model/Account';
import { Currency } from '../model/Currency';
import { Types } from 'mongoose';
import logger from '../utils/logger';
import { getExchangeRate, convertCurrency } from './currencyService';

export const getAllTransactions = async (userId: Types.ObjectId) => {
    try {
        return await Transaction.find().or([{ 'fromAccount.userId': userId }, { 'toAccount.userId': userId }]);
    } catch (error) {
        logger.error(error);
        throw error;
    }
};

export const getTransactionById = async (transactionId: string) => {
    try {
        return await Transaction.findById(transactionId);
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

        let sourceAmount = transactionData.amount;
        if (transactionData.currencyFrom.toLowerCase() !== sourceCurrency.code.toLowerCase()) {
            sourceAmount = await convertCurrency(transactionData.currencyFrom, sourceCurrency.code, transactionData.amount.toString());
        }

        if (fromAccount.balance < sourceAmount) {
            throw new Error('Insufficient funds');
        }

        const exchangeRate = await getExchangeRate(sourceCurrency._id as string, targetCurrency._id as string);

        const transaction = new Transaction({
            fromAccount: fromAccount._id,
            toAccount: toAccount._id,
            amount: sourceAmount,
            currencyFrom: sourceCurrency._id,
            currencyTo: targetCurrency._id,
            exchangeRate,
            category: transactionData.categoryId,
            timestamp: new Date(),
            status: 'pending',
        });

        fromAccount.balance -= sourceAmount;
        fromAccount.pending += sourceAmount;

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

        if (updateData.amount) {
            const fromAccount = await Account.findById(transaction.fromAccount);

            if (!fromAccount) {
                throw new Error('From account not found');
            }

            fromAccount.pending -= transaction.amount;
            fromAccount.balance += transaction.amount;

            if (fromAccount.balance < updateData.amount) {
                throw new Error('Insufficient funds');
            }

            fromAccount.pending += updateData.amount;
            fromAccount.balance -= updateData.amount;

            transaction.amount = updateData.amount;

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

        fromAccount.pending -= transaction.amount;
        fromAccount.balance += transaction.amount;

        await Promise.all([fromAccount.save(), Transaction.findByIdAndDelete(transactionId)]);
    } catch (error) {
        logger.error(error);
        throw error;
    }
};
