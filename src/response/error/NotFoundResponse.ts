import { ErrorResponse } from "./ErrorResponse";

export class NotFoundResponse extends ErrorResponse {
    constructor(message: string = "リソースが見つかりません") {
        super(message);
    }

    getStatusCode(): number {
        return 404;
    }
} 