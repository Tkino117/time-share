import { AbstractResponseData } from "../data";
import { AbstractApiResponse } from "../AbstractApiResponse";

export class CreateResponse<T extends AbstractResponseData> extends AbstractApiResponse {
    data: T;

    constructor(data: T, message: string = 'Created') {
        super(true, message, new Date().toISOString());
        this.data = data;
    }

    getStatusCode(): number {
        return 201;
    }
}