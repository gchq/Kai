import { ResetTempPasswordRepo } from '../../../src/rest/repositories/reset-temp-password-repo';

describe('ResetTempPasswrod Service', () => {
    it('should reset the password successfully with no errors', () => {
        const username = 'John Smith';
        const tempPassword = 'Password1';
        const newPassword= 'NewPassword!';

        new ResetTempPasswordRepo().setNewPassword(username, tempPassword, newPassword);

        // expect not to throw
    });
    it('should throw ... error when username is incorrect', () => {
        const username = 'invalid user name';
        const tempPassword = 'Password1';
        const newPassword= 'NewPassword!';

        new ResetTempPasswordRepo().setNewPassword(username, tempPassword, newPassword);

        // expect throw error
    });
    it('should throw ... error when temp password is incorrect', () => {
        const username = 'invalid user name';
        const tempPassword = 'Password1';
        const newPassword= 'NewPassword!';

        new ResetTempPasswordRepo().setNewPassword(username, tempPassword, newPassword);

        // expect throw error
    });
    it('should throw ... error when new password is incorrect regex', () => {
        const username = 'invalid user name';
        const tempPassword = 'Password1';
        const newPassword= 'NewPassword!';

        new ResetTempPasswordRepo().setNewPassword(username, tempPassword, newPassword);

        // expect throw error
    });
});
