import { AbstractError } from "./AbstractError";

export class AuthError extends AbstractError {
    constructor() {
        super('Authentication failed', 'AuthError');
    }
}