import { Account } from '../model/Account';
import { Currency, ICurrency } from '../model/Currency';
import { Types } from 'mongoose';
import { convertCurrency } from './currencyService';
import logger from '../utils/logger';

export const getAllAccounts = async (userId: Types.ObjectId) => {
    try {
        return await Account.find({ userId }).populate('currency').lean();
    } catch (error) {
        logger.error(`Error fetching accounts for user ${userId}: ${error}`);
        throw error;
    }
};

export const getAccountById = async (accountId: string) => {
    try {
        return await Account.findById(accountId).populate('currency').lean();
    } catch (error) {
        logger.error(`Error fetching account ${accountId}: ${error}`);
        throw error;
    }
};

export const createAccount = async (accountData: { userId: string; name: string; currency: string }) => {
    try {
        const currency = await Currency.findOne({ code: accountData.currency.toUpperCase() });
        if (!currency) {
            throw new Error(`Currency "${accountData.currency}" not found`);
        }

        // TODO[AB]: generate 30 random numbers

        const account = new Account({
            ...accountData,
            currency: currency._id,
        });
        return await account.save();
    } catch (error) {
        logger.error(`Error creating account: ${error}`);
        throw error;
    }
};

export const updateAccountById = async (accountId: string, updateData: { currency?: string; name?: string }) => {
    try {
        const account = await Account.findById(accountId);
        if (!account) {
            throw new Error(`Account with ID ${accountId} not found`);
        }

        if (updateData.currency) {
            const newCurrency: ICurrency | null = await Currency.findOne({ code: updateData.currency.toUpperCase() });
            if (!newCurrency) {
                throw new Error(`Currency "${updateData.currency}" not found`);
            }

            const currentCurrencyId = account.currency.toString();
            const newCurrencyId = newCurrency._id as Types.ObjectId;

            if (newCurrencyId.toString() !== currentCurrencyId) {
                const newBalance = await convertCurrency(currentCurrencyId, newCurrency.code, account.balance.toString());
                const newPending = await convertCurrency(currentCurrencyId, newCurrency.code, account.pending.toString());

                account.balance = newBalance;
                account.pending = newPending;
                account.currency = newCurrencyId;
            }
        }

        if (updateData.name) {
            account.name = updateData.name;
        }

        return await account.save();
    } catch (error) {
        logger.error(error);
        throw error;
    }
};

export const deleteAccountById = async (accountId: string) => {
    try {
        return await Account.findByIdAndDelete(accountId);
    } catch (error) {
        logger.error(`Error deleting account ${accountId}: ${error}`);
        throw error;
    }
};
