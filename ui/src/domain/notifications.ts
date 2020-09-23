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

    public getErrors(): Array<string> {
        return this.errors;
    }

    public concat(notes: Notifications): void {
        this.errors = this.errors.concat(notes.getErrors());
    }
}
