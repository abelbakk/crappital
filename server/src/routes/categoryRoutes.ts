import { IUser } from '../model/User';
import { Router, Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { AUTH_ERRORS } from '../utils/errorHandler';
import { getAllCategories, createCategory, updateCategoryByName, deleteCategoryByName } from '../services/categoryService';

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
     *         description: Unauthorized, user not authenticated
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: integer
     *                   example: 401
     *                 code:
     *                   type: string
     *                   example: "AUTH_ERRORS_NOT_AUTHENTICATED"
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: integer
     *                   example: 500
     */
    router.get('/', async (req: Request, res: Response, next: NextFunction) => {
        if (!req.isAuthenticated()) {
            return next({ status: 401, code: AUTH_ERRORS.NOT_AUTHENTICATED });
        }

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
     *         description: Bad request, invalid or missing fields
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: integer
     *                   example: 400
     *                 message:
     *                   type: string
     *                   example: "Category name is required"
     *       401:
     *         description: Unauthorized, user not authenticated
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: integer
     *                   example: 401
     *                 code:
     *                   type: string
     *                   example: "AUTH_ERRORS_NOT_AUTHENTICATED"
     *       403:
     *         description: Forbidden, user is not an admin
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: integer
     *                   example: 403
     *                 code:
     *                   type: string
     *                   example: "AUTH_ERRORS_NOT_ADMIN"
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: integer
     *                   example: 500
     */
    router.post('/', async (req: Request, res: Response, next: NextFunction) => {
        if (!req.isAuthenticated()) {
            return next({ status: 401, code: AUTH_ERRORS.NOT_AUTHENTICATED });
        }

        if (!(req.user as IUser)?.isAdmin) {
            return next({ status: 403, code: AUTH_ERRORS.NOT_ADMIN });
        }

        try {
            const category = await createCategory(req.body);
            res.status(201).json(category);
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
     *               $ref: '#/components/schemas/Category'
     *       400:
     *         description: Bad request, invalid or missing fields
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: integer
     *                   example: 400
     *                 message:
     *                   type: string
     *                   example: "Invalid category name"
     *       401:
     *         description: Unauthorized, user not authenticated
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: integer
     *                   example: 401
     *                 code:
     *                   type: string
     *                   example: "AUTH_ERRORS_NOT_AUTHENTICATED"
     *       403:
     *         description: Forbidden, user is not an admin
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: integer
     *                   example: 403
     *                 code:
     *                   type: string
     *                   example: "AUTH_ERRORS_NOT_ADMIN"
     *       404:
     *         description: Category not found
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: integer
     *                   example: 404
     *                 code:
     *                   type: string
     *                   example: "CATEGORY_ERRORS_NOT_FOUND"
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: integer
     *                   example: 500
     *                 code:
     *                   type: string
     *                   example: "SERVER_ERROR"
     */
    router.put('/:name', async (req: Request, res: Response, next: NextFunction) => {
        if (!req.isAuthenticated()) {
            return next({ status: 401, code: AUTH_ERRORS.NOT_AUTHENTICATED });
        }

        if (!(req.user as IUser)?.isAdmin) {
            return next({ status: 403, code: AUTH_ERRORS.NOT_ADMIN });
        }

        const { name } = req.params;
        const updateData = req.body;

        try {
            const updatedCategory = await updateCategoryByName(name, updateData);
            if (!updatedCategory) {
                return next({ status: 404, code: 'CATEGORY_ERRORS_NOT_FOUND' });
            }
            res.status(200).json(updatedCategory);
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
     *         description: Unauthorized, user not authenticated
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: integer
     *                   example: 401
     *                 code:
     *                   type: string
     *                   example: "AUTH_ERRORS_NOT_AUTHENTICATED"
     *       403:
     *         description: Forbidden, user is not an admin
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: integer
     *                   example: 403
     *                 code:
     *                   type: string
     *                   example: "AUTH_ERRORS_NOT_ADMIN"
     *       404:
     *         description: Category not found
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: integer
     *                   example: 404
     *                 code:
     *                   type: string
     *                   example: "CATEGORY_ERRORS_NOT_FOUND"
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: integer
     *                   example: 500
     */
    router.delete('/:name', async (req: Request, res: Response, next: NextFunction) => {
        if (!req.isAuthenticated()) {
            return next({ status: 401, code: AUTH_ERRORS.NOT_AUTHENTICATED });
        }

        if (!(req.user as IUser)?.isAdmin) {
            return next({ status: 403, code: AUTH_ERRORS.NOT_ADMIN });
        }

        const { name } = req.params;

        try {
            const deletedCategory = await deleteCategoryByName(name);
            if (!deletedCategory) {
                return next({ status: 404, code: 'CATEGORY_ERRORS_NOT_FOUND' });
            }
            res.status(200).json({ message: 'Category deleted successfully' });
        } catch (error) {
            logger.error(error);
            return next({ status: 500 });
        }
    });

    return router;
};
