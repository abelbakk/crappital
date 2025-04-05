import { Transaction } from '../model/Transaction';
import { Account } from '../model/Account';
import { Types } from 'mongoose';
import { convertCurrency } from './currencyService';
import logger from '../utils/logger';

const CHART_COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#8CD47E', '#EA8A8A', '#A0A7E6', '#97BBCD'];

export const getSpendingStatistics = async (
    userId: Types.ObjectId,
    fromDate: Date,
    toDate: Date,
    accountId?: string,
): Promise<{ spendings: { categoryName: string; categoryIcon: string; amount: number; color: string }[]; currency: string }> => {
    try {
        let accountFilter: { _id: Types.ObjectId } | { userId: Types.ObjectId };
        if (accountId) {
            accountFilter = { _id: new Types.ObjectId(accountId) };
        } else {
            accountFilter = { userId };
        }

        const accounts = await Account.find(accountFilter).populate('currency');
        if (!accounts.length) {
            throw new Error('No accounts found');
        }

        const accountIds = accounts.map((acc) => acc._id);
        const transactions = await Transaction.find({
            fromAccount: { $in: accountIds },
            timestamp: { $gte: fromDate, $lte: toDate },
        }).populate(['category', 'currencyFrom', 'fromAccount']);
        const spendingMap = new Map<string, { amount: number; icon: string }>();
        const baseCurrency = accounts[0].currency as any;

        for (const transaction of transactions) {
            const fromAccount = transaction.fromAccount as any;
            const category = transaction.category as any;
            let amount = transaction.amount;

            if (transaction.currencyFrom.toString() !== fromAccount.currency.toString()) {
                amount = await convertCurrency((transaction.currencyFrom as any).code, (fromAccount.currency as any).code, amount.toString());
            }

            if (fromAccount.currency.toString() !== baseCurrency._id.toString()) {
                amount = await convertCurrency((fromAccount.currency as any).code, baseCurrency.code, amount.toString());
            }

            const current = spendingMap.get(category.name) || { amount: 0, icon: category.icon };
            spendingMap.set(category.name, {
                amount: current.amount + amount,
                icon: category.icon,
            });
        }

        const spendings = Array.from(spendingMap.entries()).map(([categoryName, data], index) => ({
            categoryName,
            categoryIcon: data.icon,
            amount: Number(data.amount.toFixed(2)),
            color: CHART_COLORS[index % CHART_COLORS.length],
        }));

        return {
            spendings,
            currency: baseCurrency.code,
        };
    } catch (error) {
        logger.error(`Error getting spending statistics: ${error}`);
        throw error;
    }
};
