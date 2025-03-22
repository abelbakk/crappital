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
                NewUser: {
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
                    required: ['email', 'password', 'confirmPassword', 'firstName', 'lastName', 'phone', 'postalCode', 'country', 'county', 'city', 'street', 'number'],
                },
            },
        },
    },
    apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJSDoc(options);

export function setupSwagger(app: Express) {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
