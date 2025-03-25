import { Category } from '../model/Category';
import logger from '../utils/logger';

export const getAllCategories = async () => {
    try {
        return await Category.find().lean();
    } catch (error) {
        logger.error(error);
        throw error;
    }
};

export const createCategory = async (categoryData: { name: string; icon?: string }) => {
    try {
        const category = new Category(categoryData);
        return await category.save();
    } catch (error) {
        logger.error(error);
        throw error;
    }
};

export const updateCategoryByName = async (name: string, updateData: { newName?: string; icon?: string }) => {
    try {
        const updateFields: any = {};
        if (updateData.newName) {
            const existingCategory = await Category.findOne({ name: updateData.newName });
            if (existingCategory) {
                throw new Error(`Category "${updateData.newName}" already exists`);
            }
            updateFields.name = updateData.newName;
        }
        if (updateData.icon) {
            updateFields.icon = updateData.icon;
        }

        return await Category.findOneAndUpdate({ name }, updateFields, { new: true });
    } catch (error) {
        logger.error(error);
        throw error;
    }
};

export const deleteCategoryByName = async (name: string) => {
    try {
        return await Category.findOneAndDelete({ name });
    } catch (error) {
        logger.error(error);
        throw error;
    }
};
