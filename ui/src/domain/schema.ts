import { Notifications } from "./notifications";

export class Schema {

    private schema: any;

    constructor(schema: object){
        this.schema = schema;
    }

    public getSchema(): object {
        return this.schema;
    }

    public validation(): Notifications {
        const notes: Notifications = new Notifications();

        this.validateElements(notes);
        this.validateTypes(notes);
        this.validateInvalidProperties(notes);
        return notes;
    }

    private validateElements(notes: Notifications): void {
        if (this.schema.elements === undefined) {
            notes.addError('Elements is missing from schema');
        }
    }

    private validateTypes(notes: Notifications): void {
        if (this.schema.types === undefined) {
            notes.addError('Types is missing from schema');
        }
    }

    private validateInvalidProperties(notes: Notifications) {
        const invalidProperties = Object.keys(this.schema).filter(key =>  key !== 'elements' && key !== 'types');
        if (invalidProperties.length > 0) {
            notes.addError('["' + invalidProperties.join('", "').toString() + '"] are invalid schema properties');
        }
    }
}
