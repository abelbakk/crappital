import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ICurrency extends Document {
    code: string;
    name: string;
    exchangeRates: Map<String, Number>;
}

const CurrencySchema = new Schema<ICurrency>({
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    exchangeRates: { type: Map, of: Number },
});

export const Currency: Model<ICurrency> = mongoose.model<ICurrency>('Currency', CurrencySchema);
