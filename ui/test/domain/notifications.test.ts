import { Notifications } from "../../src/domain/notifications"

describe('Error Message', ()=> {
    it('should print out single error message', ()=> {

        const notes = new Notifications();

        notes.addError('error occured');

        expect(notes.errorMessage()).toBe('error occured')
    });
    it('should print out multiple error messages', ()=> {

        const notes = new Notifications();

        notes.addError('this happened');
        notes.addError('that happened too');

        expect(notes.errorMessage()).toBe('this happened, that happened too');
    })
})