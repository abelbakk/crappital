import { Account } from '../model/Account';
import { Currency } from '../model/Currency';
import { Types } from 'mongoose';
import logger from '../utils/logger';
import { Request } from 'express';
import { IUser } from '../model/User';

export const getAllAccounts = async (userId: Types.ObjectId) => {
    try {
        return await Account.find({ userId }).populate('currency');
    } catch (error) {
        logger.error(`Error fetching accounts for user ${userId}: ${error}`);
        throw error;
    }
};

export const getAccountById = async (accountId: string) => {
    try {
        return await Account.findById(accountId).populate('currency');
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

        const number: string = Array.from({ length: 30 }, () => Math.floor(Math.random() * 10)).join('');
        const account = new Account({
            ...accountData,
            number: number,
            currency: currency._id,
        });
        return await account.save();
    } catch (error) {
        logger.error(`Error creating account: ${error}`);
        throw error;
    }
};

export const updateAccountById = async (accountId: string, updateData: { name?: string }) => {
    try {
        const account = await Account.findById(accountId);
        if (!account) {
            throw new Error(`Account with ID ${accountId} not found`);
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

export const getUserId = (req: Request): Types.ObjectId => {
    const user: IUser = req.user as IUser;
    return user._id as Types.ObjectId;
};
