import { AbstractResponseData } from "../data";
import { AbstractApiResponse } from "../AbstractApiResponse";

export class SuccessResponse<T extends AbstractResponseData> extends AbstractApiResponse {
    data: T;

    constructor(data: T, message: string = 'Success') {
        super(true, message, new Date().toISOString());
        this.data = data;
    }

    getStatusCode(): number {
        return 200;
    }
}