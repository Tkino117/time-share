import { ErrorResponse } from "./ErrorResponse";

export class ForbiddenResponse extends ErrorResponse {
    constructor(message: string = "アクセス権限がありません") {
        super(message);
    }

    getStatusCode(): number {
        return 403;
    }
} 