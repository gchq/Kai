export class Notifications {

    private errors: Array<string> = [];

    public addError(message: string): void {
        this.errors.push(message);
    }

    public errorMessage(): string {
        return this.errors.join(', ');
    }

    public isEmpty(): boolean {
        return this.errors.length === 0;
    }
}
