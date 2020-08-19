import { RestClient } from '../../src/rest/rest-client';

describe('Rest Client', () => {
    it('should have a test', () => {
        RestClient.get();

        expect(1).toBe(1);
    });
});
