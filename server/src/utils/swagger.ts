import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Crappital core API',
            version: '1.0.0',
            description: 'API documentation for Crappital',
        },
        tags: [
            { name: 'Auth', description: 'Authentication endpoints' },
            { name: 'Users', description: 'User management endpoints' },
            { name: 'Currencies', description: 'Currency info and exchange endpoints' },
            { name: 'Categories', description: 'Transaction category endpoints' },
            { name: 'Accounts', description: 'Account management endpoints' },
        ],
        components: {
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        email: { type: 'string', format: 'email' },
                        password: { type: 'string' },
                        firstName: { type: 'string' },
                        lastName: { type: 'string' },
                        phone: { type: 'string' },
                        address: {
                            type: 'object',
                            properties: {
                                postalCode: { type: 'string' },
                                country: { type: 'string' },
                                county: { type: 'string' },
                                city: { type: 'string' },
                                street: { type: 'string' },
                                number: { type: 'string' },
                                additionalDetails: { type: 'string' },
                            },
                            required: ['postalCode', 'country', 'county', 'city', 'street', 'number'],
                        },
                        isAdmin: { type: 'boolean' },
                    },
                    required: ['email', 'password', 'firstName', 'lastName', 'address'],
                },
                UserManipulation: {
                    type: 'object',
                    properties: {
                        email: { type: 'string', format: 'email' },
                        password: { type: 'string' },
                        confirmPassword: { type: 'string' },
                        firstName: { type: 'string' },
                        lastName: { type: 'string' },
                        phone: { type: 'string' },
                        postalCode: { type: 'string' },
                        country: { type: 'string' },
                        county: { type: 'string' },
                        city: { type: 'string' },
                        street: { type: 'string' },
                        number: { type: 'string' },
                        additionalDetails: { type: 'string' },
                    },
                },
                UserInfo: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', example: '60d0fe4f5311236168a109ca' },
                        email: { type: 'string', format: 'email' },
                        firstName: { type: 'string' },
                        lastName: { type: 'string' },
                        phone: { type: 'string' },
                        address: {
                            type: 'object',
                            properties: {
                                postalCode: { type: 'string' },
                                country: { type: 'string' },
                                county: { type: 'string' },
                                city: { type: 'string' },
                                street: { type: 'string' },
                                number: { type: 'string' },
                                additionalDetails: { type: 'string' },
                            },
                            required: ['postalCode', 'country', 'county', 'city', 'street', 'number'],
                        },
                        isAdmin: { type: 'boolean' },
                    },
                    required: ['id', 'email', 'firstName', 'lastName', 'address'],
                },
                CurrencyInfo: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', example: '60d0fe4f5311236168a109cb' },
                        code: { type: 'string' },
                        name: { type: 'string' },
                    },
                    required: ['id', 'code', 'name'],
                },
                Category: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', example: '60d0fe4f5311236168a109cc' },
                        name: { type: 'string' },
                        icon: { type: 'string' },
                    },
                    required: ['id', 'name'],
                },
                Account: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: '60d0fe4f5311236168a109cd' },
                        userId: { type: 'string' },
                        name: { type: 'string' },
                        number: { type: 'string' },
                        currency: { type: 'string' },
                        balance: { type: 'number' },
                        pending: { type: 'number' },
                    },
                    required: ['id', 'userId', 'number', 'currency', 'balance', 'pending'],
                },
            },
        },
        responses: {
            BadRequest: {
                description: 'Bad request, invalid or missing fields',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                status: {
                                    type: 'integer',
                                    example: 400,
                                },
                                code: {
                                    type: 'string',
                                    example: 'GENERAL_ERRORS_MISSING_REQUEST_PARAMETERS',
                                },
                            },
                        },
                    },
                },
            },
            Unauthorized: {
                description: 'Unauthorized, user not authenticated',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                status: {
                                    type: 'integer',
                                    example: 401,
                                },
                                code: {
                                    type: 'string',
                                    example: 'AUTH_ERRORS_NOT_AUTHENTICATED',
                                },
                            },
                        },
                    },
                },
            },
            Forbidden: {
                description: 'Forbidden, user does not have the required permissions',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                status: {
                                    type: 'integer',
                                    example: 403,
                                },
                                code: {
                                    type: 'string',
                                    example: 'AUTH_ERRORS_FORBIDDEN',
                                },
                            },
                        },
                    },
                },
            },
            NotFound: {
                description: 'Resource not found',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                status: {
                                    type: 'integer',
                                    example: 404,
                                },
                                code: {
                                    type: 'string',
                                    example: 'GENERAL_ERRORS_NOT_FOUND',
                                },
                            },
                        },
                    },
                },
            },
            ServerError: {
                description: 'Internal server error',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                status: {
                                    type: 'integer',
                                    example: 500,
                                },
                            },
                        },
                    },
                },
            },
        },
    },
    apis: ['./src/routes/*.ts'],
};

export function setupSwagger(app: Express) {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerJSDoc(options)));
}
