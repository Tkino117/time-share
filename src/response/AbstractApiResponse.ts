import { Response } from 'express';

export abstract class AbstractApiResponse {
    success: boolean;
    message: string;
    timestamp: string;

    constructor(success: boolean, message: string, timestamp: string) {
        this.success = success;
        this.message = message;
        this.timestamp = timestamp;
    }
    
    abstract getStatusCode(): number;

    send(res: Response) {
        res.status(this.getStatusCode()).json(this);
    }
}