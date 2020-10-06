export class ApiError extends Error {
    private readonly errorStatus: number;
    constructor(errorStatus: number, message: string) {
        super(message);
        this.errorStatus = errorStatus;
    }
}
