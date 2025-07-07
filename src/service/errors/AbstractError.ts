export abstract class AbstractError extends Error {
    resMessage: string;
    constructor(message: string, name: string, resMessage?: string) {
        super(message);
        this.name = name;
        if (resMessage) {
            this.resMessage = resMessage;
        }
        else {
            this.resMessage = message;
        }
    }
}
