import { AbstractError } from "./AbstractError";

export class FollowAlreadyExistsError extends AbstractError {
    constructor(followerId: string, followingId: string) {
        super(`Follow already exists: ${followerId} follows ${followingId}`, 'FollowAlreadyExistsError', 'Follow already exists');
    }
}

export class FollowNotFoundError extends AbstractError {
    constructor(followerId: string, followingId: string) {
        super(`Follow not found: ${followerId} does not follow ${followingId}`, 'FollowNotFoundError', 'Follow not found');
    }
}

export class FollowPermissionError extends AbstractError {
    constructor(followerId: string, followingId: string) {
        super(`Follow permission error: ${followerId} cannot follow ${followingId}`, 'FollowPermissionError', 'Follow permission error');
    }
}

export class FollowSelfError extends AbstractError {
    constructor(followerId: string) {
        super(`Follow self error: ${followerId} cannot follow itself`, 'FollowSelfError', 'Follow self error');
    }
}