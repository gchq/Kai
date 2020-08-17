import { Schema } from "../../src/domain/schema";

describe('Validation', () => {
    it('should return missing Elements & Types notifications when both missing', () => {
        const rawSchema = {};

        const notifications =  new Schema(rawSchema).validation();

        expect(notifications.errorMessage()).toBe('Elements is missing from schema, Types is missing from schema');
    });

    it('should return missing Elements notification when elements is missing', () => {
        const rawSchema = { types: {} };

        const notifications =  new Schema(rawSchema).validation();

        expect(notifications.errorMessage()).toBe('Elements is missing from schema');
    });

    it('should return missing Elements notification when elements is missing', () => {
        const rawSchema = { elements: {} };

        const notifications =  new Schema(rawSchema).validation();

        expect(notifications.errorMessage()).toBe('Types is missing from schema');
    });

    it('should return invalid properties notification when invalid properties is in schema', () => {
        const rawSchema = { 
            unknownProperty: {},
            elements: {},
            types: {},
        };

        const notifications =  new Schema(rawSchema).validation();

        expect(notifications.errorMessage()).toBe('["unknownProperty"] are invalid schema properties');
    });

    it('should return all invalid properties notification when multi invalid properties is in schema', () => {
        const rawSchema = { 
            unknownProperty: {},
            anotherInvalidProp: {},
            elements: {},
            types: {},
        };

        const notifications =  new Schema(rawSchema).validation();

        expect(notifications.errorMessage()).toBe('["unknownProperty", "anotherInvalidProp"] are invalid schema properties');
    });
});
