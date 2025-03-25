import mongoose, { Document, Model, Schema } from 'mongoose';

interface ICategory extends Document {
    name: string;
    icon: string;
}

const CategorySchema = new Schema<ICategory>({
    name: { type: String, required: true, unique: true },
    icon: { type: String, default: '💰' },
});

export const Category: Model<ICategory> = mongoose.model<ICategory>('Category', CategorySchema);
