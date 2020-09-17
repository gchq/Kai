import { Notifications } from '../../src/domain/notifications';

describe('Error Message', () => {
    it('should print out single error message', () => {
        const notes = new Notifications();

        notes.addError('error occured');

        expect(notes.errorMessage()).toBe('error occured');
    });

    it('should print out multiple error messages', () => {
        const notes = new Notifications();

        notes.addError('this happened');
        notes.addError('that happened too');

        expect(notes.errorMessage()).toBe('this happened, that happened too');
    });
    it('should add notifications', () => {
        const notes1 = new Notifications();
        const notes2 = new Notifications();

        notes1.addError('notification 1');
        notes2.addError('notification 2');

        notes1.concat(notes2);

        expect(notes1.errorMessage()).toBe('notification 1, notification 2');
    });
    it('should print out error message when second notes is empty', () => {
        const notes1 = new Notifications();
        const notes2 = new Notifications();

        notes1.addError('notification 1');

        notes1.concat(notes2);

        expect(notes1.errorMessage()).toBe('notification 1');
    });
    it('should print out error message when first notes is empty', () => {
        const notes1 = new Notifications();
        const notes2 = new Notifications();

        notes2.addError('notification 2');

        notes1.concat(notes2);

        expect(notes1.errorMessage()).toBe('notification 2');
    });
    it('should be empty when both notes are empty', () =>{
        const notes1 = new Notifications();
        const notes2 = new Notifications();

        notes1.concat(notes2);

        expect(notes1.isEmpty()).toBe(true);
    })
});
