import { convertCurrency } from '../../src/services/currencyService';
import { Currency } from '../../src/model/Currency';

jest.mock('../../src/model/Currency');

const currencyFindOneMock = Currency.findOne as jest.Mock;

describe('currency service - convertCurrency', () => {
    beforeEach(() => {
        currencyFindOneMock.mockReset();
    });

    it('should correctly convert', async () => {
        // arrange
        const mockUsd = {
            code: 'USD',
            exchangeRates: new Map([['EUR', 0.92]]),
        };
        const mockEur = { code: 'EUR' };

        currencyFindOneMock.mockResolvedValueOnce(mockUsd);
        currencyFindOneMock.mockResolvedValueOnce(mockEur);

        // act
        const result = await convertCurrency('USD', 'EUR', '100');

        // assert
        expect(result).toBe(100 * 0.92);
        expect(currencyFindOneMock).toHaveBeenCalledTimes(2);
        expect(currencyFindOneMock).toHaveBeenCalledWith({ code: 'USD' });
        expect(currencyFindOneMock).toHaveBeenCalledWith({ code: 'EUR' });
    });

    it('should throw when the from currency is missing', async () => {
        // arrange
        currencyFindOneMock.mockResolvedValueOnce(null);

        // act & assert
        await expect(convertCurrency('random', 'EUR', '100')).rejects.toThrow('Currency "random" not found');
    });

    it('should throw when the to currency is missing', async () => {
        // arrange
        const mockUsd = { code: 'USD' };
        currencyFindOneMock.mockResolvedValueOnce(mockUsd);
        currencyFindOneMock.mockResolvedValueOnce(null);

        // act & assert
        await expect(convertCurrency('USD', 'random', '100')).rejects.toThrow('Currency "random" not found');
    });

    it('should throw when the amount is invalid', async () => {
        // arrange
        const mockUsd = { code: 'USD' };
        const mockEur = { code: 'EUR' };
        currencyFindOneMock.mockResolvedValueOnce(mockUsd);
        currencyFindOneMock.mockResolvedValueOnce(mockEur);

        // act & assert
        await expect(convertCurrency('USD', 'EUR', 'invalid')).rejects.toThrow('Invalid amount "invalid"');
    });

    it('should throw when the amount is non-positive', async () => {
        // arrange
        const mockUsd = { code: 'USD' };
        const mockEur = { code: 'EUR' };
        currencyFindOneMock.mockResolvedValueOnce(mockUsd);
        currencyFindOneMock.mockResolvedValueOnce(mockEur);

        // act & assert
        await expect(convertCurrency('USD', 'EUR', '0')).rejects.toThrow('Invalid amount "0"');
    });

    it('should throw when the exchange rate is unavailable', async () => {
        // arrange
        const mockUsd = {
            code: 'USD',
            exchangeRates: new Map([['JPY', 150]]),
        };
        const mockEur = { code: 'EUR' };
        currencyFindOneMock.mockResolvedValueOnce(mockUsd);
        currencyFindOneMock.mockResolvedValueOnce(mockEur);

        // act & assert
        await expect(convertCurrency('USD', 'EUR', '100')).rejects.toThrow('Exchange rate from "USD" to "EUR" is unavailable');
    });
});
