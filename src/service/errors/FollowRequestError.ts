import { AbstractError } from "./AbstractError";

export class FollowRequestNotFoundError extends AbstractError {
    constructor(fromUserId: string, toUserId: string) {
        super(`Follow request not found: ${fromUserId} does not request to follow ${toUserId}`, 'FollowRequestNotFoundError', 'Follow request not found');
    }
}

export class FollowRequestAlreadyExistsError extends AbstractError {
    constructor(fromUserId: string, toUserId: string) {
        super(`Follow request already exists: ${fromUserId} already requests to follow ${toUserId}`, 'FollowRequestAlreadyExistsError', 'Follow request already exists');
    }
}

export class FollowRequestNotRequiredError extends AbstractError {
    constructor(fromUserId: string, toUserId: string) {
        super(`Follow request not required: ${fromUserId} does not need to request to follow ${toUserId}`, 'FollowRequestNotRequiredError', 'Follow request not required');
    }
}