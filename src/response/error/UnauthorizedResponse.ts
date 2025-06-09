import { ErrorResponse } from "./ErrorResponse";

export class UnauthorizedResponse extends ErrorResponse {
    constructor(message: string = "ユーザー認証が必要です") {
        super(message);
    }

    getStatusCode(): number {
        return 401;
    }
} 