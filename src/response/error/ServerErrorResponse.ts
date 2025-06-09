import { ErrorResponse } from "./ErrorResponse";

export class ServerErrorResponse extends ErrorResponse {
    constructor(message: string = 'Internal server error') {
        super(message);
    }

    getStatusCode(): number {
        return 500;
    }
}