import mongoose, { Document, Model, Schema, Types } from 'mongoose';

interface ITransaction extends Document {
    fromAccount: Types.ObjectId;
    toAccount: Types.ObjectId;
    amount: number;
    currencyFrom: Types.ObjectId;
    currencyTo: Types.ObjectId;
    exchangeRate: number;
    timestamp: Date;
    status: string;
    category: Types.ObjectId;
}

const TransactionSchema = new Schema<ITransaction>({
    fromAccount: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
    toAccount: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
    amount: { type: Number, required: true },
    currencyFrom: { type: Schema.Types.ObjectId, ref: 'Currency', required: true },
    currencyTo: { type: Schema.Types.ObjectId, ref: 'Currency', required: true },
    exchangeRate: { type: Number, required: true },
    timestamp: { type: Date, required: true, default: Date.now },
    status: { type: String, enum: ['pending', 'completed', 'rejected'], default: 'pending', required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
});

export const Transaction: Model<ITransaction> = mongoose.model<ITransaction>('Transaction', TransactionSchema);
