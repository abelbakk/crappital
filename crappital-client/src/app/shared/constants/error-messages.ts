export const ERROR_MESSAGES: Record<string, string> = {
    AUTH_ERRORS_INVALID_CREDENTIALS: 'Invalid credentials. Please try again.',
    AUTH_ERRORS_USER_NOT_FOUND: 'User not found.',
    AUTH_ERRORS_NOT_AUTHENTICATED: 'You are not authenticated. Please log in.',
    AUTH_ERRORS_NOT_ADMIN: 'You do not have administrator permissions.',
    AUTH_ERRORS_FORBIDDEN: 'You do not have the required permissions to perform this action.',
    AUTH_ERRORS_USER_NOT_APPROVED: 'Your account is not approved yet.',
    AUTH_ERRORS_USER_ACCOUNT_RESTRICTED: 'Your account is restricted.',

    USER_ERRORS_DUPLICATE_EMAIL: 'This email is already in use.',
    USER_ERRORS_PASSWORD_MISMATCH: 'Passwords do not match.',

    GENERAL_ERRORS_MISSING_REQUEST_PARAMETERS: 'Missing required information.',
    GENERAL_ERRORS_NOT_FOUND: 'Resource not found.',

    ACCOUNT_ERRORS_ACCOUNT_NOT_FOUND: 'Account not found.',
};

export const GENERIC_ERROR_MESSAGE = 'An unexpected error occurred. Please try again.';
