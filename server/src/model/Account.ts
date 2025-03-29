import mongoose, { Document, Model, Schema, Types } from 'mongoose';

interface IAccount extends Document {
    userId: Types.ObjectId;
    name: string;
    number: string;
    currency: Types.ObjectId;
    balance: number;
    pending: number;
}

const AccountSchema = new Schema<IAccount>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: false },
    number: { type: String, required: true, unique: true },
    currency: { type: Schema.Types.ObjectId, ref: 'Currency', required: true },
    balance: { type: Number, required: true, default: 0 },
    pending: { type: Number, required: true, default: 0 },
});

export const Account: Model<IAccount> = mongoose.model<IAccount>('Account', AccountSchema);
