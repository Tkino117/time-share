import { AbstractError } from "./AbstractError";

export class UserNotFoundError extends AbstractError {
    constructor(userId: string) {
        super(`User not found: ${userId}`, 'UserNotFoundError', 'User not found');
    }
}

export class UserAlreadyExistsError extends AbstractError {
    constructor(userId: string) {
        super(`User already exists: ${userId}`, 'UserAlreadyExistsError', 'User already exists');
    }
}

export class InvalidPasswordError extends AbstractError {
    constructor() {
        super('Invalid password', 'InvalidPasswordError');
    }
}

export class InvalidUserIdError extends AbstractError {
    constructor() {
        super('Invalid user id', 'InvalidUserIdError');
    }
}

export class InvalidNameError extends AbstractError {
    constructor() {
        super('Invalid name', 'InvalidNameError');
    }
}

export class UnauthorizedError extends AbstractError {
    constructor() {
        super('Unauthorized', 'UnauthorizedError');
    }
}