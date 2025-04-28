import { User } from '../model/User';
import { Transaction } from '../model/Transaction';
import { Account } from '../model/Account';
import logger from '../utils/logger';
import { Currency } from '../model/Currency';
import { convertCurrency } from './currencyService';

export const getUnapprovedUsers = async () => {
    try {
        return await User.find({ approved: null }).select('-password');
    } catch (error) {
        logger.error(error);
        throw error;
    }
};

export const approveUser = async (userId: string) => {
    try {
        return await User.findByIdAndUpdate(userId, { approved: new Date() }, { new: true }).select('-password');
    } catch (error) {
        logger.error(error);
        throw error;
    }
};

export const restrictUser = async (userId: string, until: Date) => {
    try {
        return await User.findByIdAndUpdate(userId, { restricted: until }, { new: true }).select('-password');
    } catch (error) {
        logger.error(error);
        throw error;
    }
};

export const getPendingTransactions = async () => {
    try {
        return await Transaction.find({ status: 'pending' })
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

export const approveTransaction = async (transactionId: string) => {
    try {
        const transaction = await Transaction.findById(transactionId);
        if (!transaction) {
            throw new Error('Transaction not found');
        }

        const [fromAccount, toAccount] = await Promise.all([Account.findById(transaction.fromAccount), Account.findById(transaction.toAccount)]);
        if (!fromAccount || !toAccount) {
            throw new Error('One or both accounts not found');
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
        const creditedAmount = transaction.amount * transaction.exchangeRate;
        toAccount.balance += creditedAmount;
        transaction.status = 'completed';
        await Promise.all([fromAccount.save(), toAccount.save(), transaction.save()]);
        return transaction;
    } catch (error) {
        logger.error(error);
        throw error;
    }
};

export const rejectTransaction = async (transactionId: string) => {
    try {
        const transaction = await Transaction.findById(transactionId);
        if (!transaction) {
            throw new Error('Transaction not found');
        }

        const fromAccount = await Account.findById(transaction.fromAccount);
        if (!fromAccount) {
            throw new Error('Source account not found');
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
        transaction.status = 'rejected';
        await Promise.all([fromAccount.save(), transaction.save()]);
        return transaction;
    } catch (error) {
        logger.error(error);
        throw error;
    }
};
