import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

const SALT_FACTOR = 10;

export interface IUser extends Document {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    address: {
        postalCode: string;
        country: string;
        county: string;
        city: string;
        street: string;
        number: string;
        additionalDetails?: string;
    };
    isAdmin?: boolean;
    approved: Date | null;
    restricted: Date | null;
    comparePassword: (candidatePassword: string, callback: (error: Error | null, isMatch: boolean) => void) => void;
}

const AddressSchema = new Schema({
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    county: { type: String, required: true },
    city: { type: String, required: true },
    street: { type: String, required: true },
    number: { type: String, required: true },
    additionalDetails: { type: String, required: false },
});

const UserSchema = new Schema<IUser>({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true },
    address: AddressSchema,
    isAdmin: { type: Boolean, required: false },
    approved: { type: Date, required: false, default: null },
    restricted: { type: Date, required: false, default: null },
});

UserSchema.pre<IUser>('save', function (next) {
    const user = this;
    bcrypt.genSalt(SALT_FACTOR, (error, salt) => {
        if (error) {
            return next(error);
        }
        bcrypt.hash(user.password, salt, (err, encrypted) => {
            if (err) {
                return next(err);
            }
            user.password = encrypted;
            next();
        });
    });
});

UserSchema.methods.comparePassword = function (candidatePassword: string, callback: (error: Error | null, isMatch: boolean) => void): void {
    const user = this;
    bcrypt.compare(candidatePassword, user.password, (error, isMatch) => {
        if (error) {
            callback(error, false);
        }
        callback(null, isMatch);
    });
};

export const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);
