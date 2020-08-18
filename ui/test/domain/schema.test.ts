import { Schema } from "../../src/domain/schema";

describe('Validation', () => {
    it('should return invalid JSON notifications when string is not JSON format', () => {
        const invalidJsonString = 'invalid: blahJson';

        const notifications =  new Schema(invalidJsonString).validation();

        expect(notifications.errorMessage()).toBe('Schema is not valid JSON');
    });

    it('should return missing Elements & Types notifications when both missing', () => {
        const rawSchema = JSON.stringify({});

        const notifications =  new Schema(rawSchema).validation();

        expect(notifications.errorMessage()).toBe('Elements is missing from schema, Types is missing from schema');
    });

    it('should return missing Elements notification when elements is missing', () => {
        const rawSchema = JSON.stringify({ types: {} });

        const notifications =  new Schema(rawSchema).validation();

        expect(notifications.errorMessage()).toBe('Elements is missing from schema');
    });

    it('should return missing Elements notification when elements is missing', () => {
        const rawSchema = JSON.stringify({ elements: {} });

        const notifications =  new Schema(rawSchema).validation();

        expect(notifications.errorMessage()).toBe('Types is missing from schema');
    });

    it('should return invalid properties notification when invalid properties is in schema', () => {
        const rawSchema = JSON.stringify({ 
            unknownProperty: {},
            elements: {},
            types: {},
        });

        const notifications =  new Schema(rawSchema).validation();

        expect(notifications.errorMessage()).toBe('["unknownProperty"] are invalid schema root properties');
    });

    it('should return all invalid properties notification when multi invalid properties is in schema', () => {
        const rawSchema = JSON.stringify({ 
            unknownProperty: {},
            anotherInvalidProp: {},
            elements: {},
            types: {},
        });

        const notifications =  new Schema(rawSchema).validation();

        expect(notifications.errorMessage()).toBe('["unknownProperty", "anotherInvalidProp"] are invalid schema root properties');
    });
});
