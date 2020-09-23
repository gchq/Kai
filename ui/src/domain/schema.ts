import { Notifications } from './notifications';

export class Schema {
    
    private schema: any;

    constructor(schema: string) {
        this.schema = schema;
    }

    public getSchema(): ISchema {
        return this.schema;
    }

    public validate(): Notifications {
        const notes: Notifications = new Notifications();
        if (this.schema.length === 0) {
            notes.addError('Schema is empty');
            return notes;
        }

        if (!this.schemaIsValidJson(notes)) {
            return notes;
        }

        this.validateElements(notes);
        this.validateTypes(notes);
        this.validateInvalidProperties(notes);
        return notes;
    }

    private schemaIsValidJson(notes: Notifications): boolean {
        try {
            this.schema = JSON.parse(this.schema);
            return true;
        } catch (e) {
            notes.addError('Schema is not valid JSON');
            return false;
        }
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
        const invalidProperties = Object.keys(this.schema).filter((key) => key !== 'elements' && key !== 'types');

        if (invalidProperties.length > 0) {
            notes.addError('["' + invalidProperties.join('", "').toString() + '"] are invalid schema root properties');
        }
    }
}

export interface ISchema {
    elements: object;
    types: object;
}
