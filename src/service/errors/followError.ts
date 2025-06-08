export class FollowAlreadyExistsError extends Error {
    constructor(followerId: string, followingId: string) {
        super(`Follow already exists: ${followerId} follows ${followingId}`);
        this.name = 'FollowAlreadyExistsError';
    }
}

export class FollowNotFoundError extends Error {
    constructor(followerId: string, followingId: string) {
        super(`Follow not found: ${followerId} does not follow ${followingId}`);
        this.name = 'FollowNotFoundError';
    }
}