import { AbstractApiResponse } from "../AbstractApiResponse";

export class ErrorResponse extends AbstractApiResponse {
    constructor(message: string) {
        super(false, message, new Date().toISOString());
    }

    getStatusCode(): number {
        return 400;
    }
}