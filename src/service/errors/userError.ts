export class UserNotFoundError extends Error {
    constructor(userId: string) {
        super(`User not found: ${userId}`);
        this.name = 'UserNotFoundError';
    }
}

export class UserAlreadyExistsError extends Error {
    constructor(userId: string) {
        super(`User already exists: ${userId}`);
        this.name = 'UserAlreadyExistsError';
    }
}

export class InvalidPasswordError extends Error {
    constructor() {
        super('Invalid password');
        this.name = 'InvalidPasswordError';
    }
}

export class InvalidUserIdError extends Error {
    constructor() {
        super('Invalid user id');
        this.name = 'InvalidUserIdError';
    }
}

export class InvalidNameError extends Error {
    constructor() {
        super('Invalid name');
        this.name = 'InvalidNameError';
    }
}