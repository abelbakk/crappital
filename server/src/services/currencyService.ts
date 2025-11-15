import axios from 'axios';
import xml2js from 'xml2js';
import { Currency } from '../model/Currency';
import logger from '../utils/logger';

const CURRENCY_NAMES: { [key: string]: string } = {
    EUR: 'Euro',
    USD: 'US Dollar',
    JPY: 'Japanese Yen',
    BGN: 'Bulgarian Lev',
    CZK: 'Czech Koruna',
    DKK: 'Danish Krone',
    GBP: 'British Pound Sterling',
    HUF: 'Hungarian Forint',
    PLN: 'Polish Zloty',
    RON: 'Romanian Leu',
    SEK: 'Swedish Krona',
    CHF: 'Swiss Franc',
    ISK: 'Icelandic Króna',
    NOK: 'Norwegian Krone',
    TRY: 'Turkish Lira',
    AUD: 'Australian Dollar',
    BRL: 'Brazilian Real',
    CAD: 'Canadian Dollar',
    CNY: 'Chinese Yuan',
    HKD: 'Hong Kong Dollar',
    IDR: 'Indonesian Rupiah',
    ILS: 'Israeli New Shekel',
    INR: 'Indian Rupee',
    KRW: 'South Korean Won',
    MXN: 'Mexican Peso',
    MYR: 'Malaysian Ringgit',
    NZD: 'New Zealand Dollar',
    PHP: 'Philippine Peso',
    SGD: 'Singapore Dollar',
    THB: 'Thai Baht',
    ZAR: 'South African Rand',
};

export const convertCurrency = async (from: string, to: string, amount: string) => {
    try {
        const fromCurrency = await Currency.findOne({ code: from.toUpperCase() });
        const toCurrency = await Currency.findOne({ code: to.toUpperCase() });

        if (!fromCurrency) {
            throw new Error(`Currency "${from}" not found`);
        }
        if (!toCurrency) {
            throw new Error(`Currency "${to}" not found`);
        }

        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            throw new Error(`Invalid amount "${amount}"`);
        }

        const exchangeRate = fromCurrency.exchangeRates.get(to.toUpperCase()) as number | undefined;
        if (!exchangeRate || exchangeRate === undefined) {
            throw new Error(`Exchange rate from "${from}" to "${to}" is unavailable`);
        }

        return numericAmount * exchangeRate;
    } catch (error) {
        logger.error(error);
        throw error;
    }
};

export const updateExchangeRates = async () => {
    try {
        const { data: xmlData } = await axios.get('https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml');
        const result = await xml2js.parseStringPromise(xmlData);
        const cubeData: Array<{ $: { currency: string; rate: string } }> = result['gesmes:Envelope'].Cube[0].Cube[0].Cube;
        const rates: { [key: string]: number } = {};
        cubeData.forEach((rateInfo) => {
            const currency: string = rateInfo.$.currency;
            const rate: number = parseFloat(rateInfo.$.rate);
            rates[currency] = rate;
        });
        rates['EUR'] = 1;
        for (const baseCurrency in rates) {
            const exchangeRates: { [key: string]: number } = {};
            for (const targetCurrency in rates) {
                exchangeRates[targetCurrency] = rates[targetCurrency] / rates[baseCurrency];
            }
            await Currency.findOneAndUpdate({ code: baseCurrency }, { name: CURRENCY_NAMES[baseCurrency] || baseCurrency, exchangeRates }, { upsert: true });
        }
    } catch (error) {
        logger.error(error);
    }
};

export const getExchangeRate = async (fromCurrencyId: string, toCurrencyId: string): Promise<Number> => {
    try {
        const [fromCurrency, toCurrency] = await Promise.all([Currency.findById(fromCurrencyId), Currency.findById(toCurrencyId)]);

        if (!fromCurrency || !toCurrency) {
            throw new Error('One or both currencies not found');
        }

        const exchangeRate = fromCurrency.exchangeRates.get(toCurrency.code);
        if (!exchangeRate) {
            throw new Error(`Exchange rate from ${fromCurrency.code} to ${toCurrency.code} not available`);
        }

        return exchangeRate;
    } catch (error) {
        logger.error(error);
        throw error;
    }
};
