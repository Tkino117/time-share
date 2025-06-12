export class AuthError extends Error {
    constructor() {
        super('Authentication failed');
        this.name = 'AuthError';
    }
}