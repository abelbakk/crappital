import { User } from '../model/User';
import { Transaction } from '../model/Transaction';
import { Account } from '../model/Account';
import logger from '../utils/logger';

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

        fromAccount.pending -= transaction.amount;
        toAccount.balance += transaction.amount * transaction.exchangeRate;

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

        fromAccount.pending -= transaction.amount;
        fromAccount.balance += transaction.amount;

        transaction.status = 'rejected';

        await Promise.all([fromAccount.save(), transaction.save()]);

        return transaction;
    } catch (error) {
        logger.error(error);
        throw error;
    }
};
