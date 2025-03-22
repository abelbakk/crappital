import { IUser, User } from '../model/User';
import { Router, Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { AUTH_ERRORS, USER_ERRORS } from '../utils/errorHandler';

export const userRoutes = (router: Router): Router => {
    /**
     * @swagger
     * /core/users:
     *   post:
     *     summary: Create a new user
     *     tags: [Users]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/UserManipulation'
     *     responses:
     *       201:
     *         description: User created successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 userId:
     *                   type: string
     *       400:
     *         description: Bad request (Duplicate email or password mismatch)
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: integer
     *                   example: 400
     *                 code:
     *                   type: string
     *                   enum: ["USER_ERRORS_DUPLICATE_EMAIL", "USER_ERRORS_PASSWORD_MISMATCH"]
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
    router.post('/users', async (req: Request, res: Response, next: NextFunction) => {
        const { email, password, confirmPassword, firstName, lastName, phone, postalCode, country, county, city, street, number, additionalDetails } = req.body;
        try {
            const existingUser = await User.findOne({ email });

            if (existingUser) {
                return next({ status: 400, code: USER_ERRORS.DUPLICATE_EMAIL });
            }

            if (password !== confirmPassword) {
                return next({ status: 400, code: USER_ERRORS.PASSWORD_MISMATCH });
            }

            const user = new User({
                email,
                password,
                firstName,
                lastName,
                phone,
                address: {
                    postalCode,
                    country,
                    county,
                    city,
                    street,
                    number,
                    additionalDetails,
                },
            });
            await user.save();
            res.status(201).json({ userId: user._id });
        } catch (err) {
            logger.error(err);
            return next({ status: 500 });
        }
    });

    /**
     * @swagger
     * /core/users:
     *   get:
     *     summary: Get all users (requires administrator permissions)
     *     description: Returns a list of all registered users. Only accessible by admins.
     *     tags: [Users]
     *     responses:
     *       200:
     *         description: Successfully retrieved the list of users
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/UserInfo'
     *       401:
     *         description: User is not authenticated
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
     *         description: User is not authorized (not an admin)
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
     */
    router.get('/users', (req: Request, res: Response, next: NextFunction) => {
        if (!req.isAuthenticated()) {
            return next({ status: 401, code: AUTH_ERRORS.NOT_AUTHENTICATED });
        }

        if (!(req.user as IUser)?.isAdmin) {
            return next({ status: 403, code: AUTH_ERRORS.NOT_ADMIN });
        }

        User.find()
            .lean()
            .then((users) => {
                logger.debug(JSON.stringify(users));
                const usersInfo = users.map(({ password, ...userInfo }: IUser) => userInfo);
                res.status(200).json(usersInfo);
            })
            .catch((error) => {
                logger.error(error);
                next({ status: 500 });
            });
    });

    /**
     * @swagger
     * /core/users/{id}:
     *   delete:
     *     summary: Delete a user (requires self or administrator permissions)
     *     description: Users can delete their own account. Admins can delete any user.
     *     tags: [Users]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: The ID of the user to delete
     *     responses:
     *       200:
     *         description: User deleted successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: "User deleted successfully"
     *       400:
     *         description: Invalid request (missing or incorrect ID)
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: integer
     *                   example: 400
     *       401:
     *         description: User is not authenticated
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
     *         description: Forbidden - User can only delete themselves, unless they are an admin
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
     *                   example: "AUTH_ERRORS_FORBIDDEN"
     *       404:
     *         description: User not found
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
     *                   example: "AUTH_ERRORS_USER_NOT_FOUND"
     *       500:
     *         description: Internal server error
     */
    router.delete('/users/:id', (req: Request, res: Response, next: NextFunction) => {
        if (!req.isAuthenticated()) {
            return next({ status: 401, code: AUTH_ERRORS.NOT_AUTHENTICATED });
        }

        const userId = req.params.id;
        const requestUser = req.user as IUser;

        if (!userId) {
            return next({ status: 400 });
        }

        if (!(requestUser._id?.toString() === userId || requestUser.isAdmin)) {
            return next({ status: 403, code: AUTH_ERRORS.FORBIDDEN });
        }

        User.deleteOne({ _id: userId })
            .then((result) => {
                if (result.deletedCount === 0) {
                    return next({ status: 404, code: AUTH_ERRORS.USER_NOT_FOUND });
                }
                res.status(200).json({ success: true, message: 'User deleted successfully' });
            })
            .catch((error) => {
                logger.error(error);
                next({ status: 500 });
            });
    });

    /**
     * @swagger
     * /core/users/{id}:
     *   put:
     *     summary: Update an existing user
     *     description: Updates a user's details, allowing modification of all fields. Special handling for password and email fields.
     *     tags:
     *       - Users
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: The ID of the user to update
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/UserManipulation'
     *     responses:
     *       200:
     *         description: Successfully updated user
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 userId:
     *                   type: string
     *                   example: "60d0fe4f5311236168a109ca"
     *       400:
     *         description: Bad request (invalid fields, password mismatch, email already taken)
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: integer
     *                   example: 400
     *                 code:
     *                   type: string
     *                   enum: ["USER_ERRORS_DUPLICATE_EMAIL", "USER_ERRORS_PASSWORD_MISMATCH"]
     *       401:
     *         description: Not authenticated (user must be logged in)
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
     *         description: Forbidden - User not authorized to modify this account
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
     *                   example: "AUTH_ERRORS_FORBIDDEN"
     *       404:
     *         description: User not found
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
     *                   example: "AUTH_ERRORS_USER_NOT_FOUND"
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
    router.put('/users/:id', async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.isAuthenticated()) {
                return next({ status: 401, code: AUTH_ERRORS.NOT_AUTHENTICATED });
            }

            const userId = req.params.id;
            const requestUser = req.user as IUser;

            if (!userId) {
                return next({ status: 400 });
            }

            if (!(requestUser._id?.toString() === userId || requestUser.isAdmin)) {
                return next({ status: 403, code: AUTH_ERRORS.FORBIDDEN });
            }

            const { confirmPassword, ...updateData } = req.body;

            const user = await User.findById(userId);
            if (!user) {
                return next({ status: 404, code: AUTH_ERRORS.USER_NOT_FOUND });
            }

            if (updateData.password) {
                if (!confirmPassword || updateData.password !== confirmPassword) {
                    return next({ status: 400, code: USER_ERRORS.PASSWORD_MISMATCH });
                }
                user.password = confirmPassword;
            }

            if (updateData.email && updateData.email !== user.email) {
                const existingUser = await User.findOne({ email: updateData.email });
                if (existingUser) {
                    return next({ status: 400, code: USER_ERRORS.DUPLICATE_EMAIL });
                }
            }

            if (Object.keys(updateData).length > 0) {
                Object.assign(user, updateData);
                await user.save();
            }
            // refresh the session
            req.login(user, (err: string | null) => {
                if (err) {
                    logger.error(err);
                    return next({ status: 500 });
                }
                res.status(200).json({ userId: user._id });
            });
        } catch (err) {
            logger.error(err);
            return next({ status: 500 });
        }
    });

    return router;
};
