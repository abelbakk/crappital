import mongoose, { Document, Model, Schema } from 'mongoose';

interface ICurrency extends Document {
    code: string;
    name: string;
    exchangeRates: Map<String, Number>;
}

const CurrencySchema = new Schema({
    code: { type: String, required: true },
    name: { type: String, required: true },
    exchangeRates: { type: Map, of: Number },
});

export const Currency: Model<ICurrency> = mongoose.model<ICurrency>('Currency', CurrencySchema);
