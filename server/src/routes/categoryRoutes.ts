import { Router, Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { GENERAL_ERRORS } from '../utils/errorHandler';
import { getAllCategories, createCategory, updateCategoryByName, deleteCategoryByName } from '../services/categoryService';
import { isAdmin, isAuthenticated } from '../middleware/authMiddleware';

export const categoryRoutes = (router: Router): Router => {
    /**
     * @swagger
     * /core/categories:
     *   get:
     *     summary: Get all categories
     *     description: Returns a list of all transaction categories.
     *     tags:
     *       - Categories
     *     responses:
     *       200:
     *         description: A list of categories
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Category'
     *       401:
     *         $ref: '#/components/responses/Unauthorized'
     *       500:
     *         $ref: '#/components/responses/ServerError'
     */
    router.get('/', isAuthenticated, async (_: Request, res: Response, next: NextFunction) => {
        try {
            const categories = await getAllCategories();
            res.status(200).json(categories);
        } catch (error) {
            logger.error(error);
            return next({ status: 500 });
        }
    });

    /**
     * @swagger
     * /core/categories:
     *   post:
     *     summary: Create a new category
     *     description: Adds a new transaction category.
     *     tags:
     *       - Categories
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - name
     *             properties:
     *               name:
     *                 type: string
     *                 example: "Food"
     *               icon:
     *                 type: string
     *                 example: "🍔"
     *     responses:
     *       201:
     *         description: Category created successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Category'
     *       400:
     *         $ref: '#/components/responses/BadRequest'
     *       401:
     *         $ref: '#/components/responses/Unauthorized'
     *       403:
     *         $ref: '#/components/responses/Forbidden'
     *       500:
     *         $ref: '#/components/responses/ServerError'
     */
    router.post('/', isAuthenticated, isAdmin, async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { name, icon } = req.body;
            if (!name || !icon) {
                return next({ status: 400, code: GENERAL_ERRORS.MISSING_REQUEST_PARAMETERS });
            }
            const category = await createCategory(req.body);
            res.status(201).json({ id: category._id, ...category.toObject() });
        } catch (error) {
            logger.error(error);
            return next({ status: 500 });
        }
    });

    /**
     * @swagger
     * /core/categories/{name}:
     *   put:
     *     summary: Update an existing category
     *     description: Updates the details of an existing transaction category by its name.
     *     tags:
     *       - Categories
     *     parameters:
     *       - in: path
     *         name: name
     *         required: true
     *         schema:
     *           type: string
     *         description: The name of the category to update
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               newName:
     *                 type: string
     *                 example: "Updated Category Name"
     *               icon:
     *                 type: string
     *                 example: "🎨"
     *     responses:
     *       200:
     *         description: Category updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Category
     *       400:
     *         $ref: '#/components/responses/BadRequest'
     *       401:
     *         $ref: '#/components/responses/Unauthorized'
     *       403:
     *         $ref: '#/components/responses/Forbidden'
     *       404:
     *         $ref: '#/components/responses/NotFound'
     *       500:
     *         $ref: '#/components/responses/ServerError'
     */
    router.put('/:name', isAuthenticated, isAdmin, async (req: Request, res: Response, next: NextFunction) => {
        const { name } = req.params;
        if (!name) {
            return next({ status: 400, code: GENERAL_ERRORS.MISSING_REQUEST_PARAMETERS });
        }
        try {
            const updatedCategory = await updateCategoryByName(name, req.body);
            if (!updatedCategory) {
                return next({ status: 404, code: GENERAL_ERRORS.NOT_FOUND });
            }
            res.status(200).json({ id: updatedCategory._id, ...updatedCategory.toObject() });
        } catch (error) {
            logger.error(error);
            return next({ status: 500 });
        }
    });

    /**
     * @swagger
     * /core/categories/{name}:
     *   delete:
     *     summary: Delete a category
     *     description: Deletes a transaction category by its name.
     *     tags:
     *       - Categories
     *     parameters:
     *       - in: path
     *         name: name
     *         required: true
     *         schema:
     *           type: string
     *         description: The name of the category to delete
     *     responses:
     *       200:
     *         description: Category deleted successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Category deleted successfully"
     *       401:
     *         $ref: '#/components/responses/Unauthorized'
     *       403:
     *         $ref: '#/components/responses/Forbidden'
     *       404:
     *         $ref: '#/components/responses/NotFound'
     *       500:
     *         $ref: '#/components/responses/ServerError'
     */
    router.delete('/:name', isAuthenticated, isAdmin, async (req: Request, res: Response, next: NextFunction) => {
        const { name } = req.params;
        if (!name) {
            return next({ status: 400, code: GENERAL_ERRORS.MISSING_REQUEST_PARAMETERS });
        }
        try {
            const deletedCategory = await deleteCategoryByName(name);
            if (!deletedCategory) {
                return next({ status: 404, code: GENERAL_ERRORS.NOT_FOUND });
            }
            res.status(200).json({ id: deletedCategory._id, message: 'Category deleted successfully' });
        } catch (error) {
            logger.error(error);
            return next({ status: 500 });
        }
    });

    return router;
};
