import { DeleteGraphRepo } from '../../../src/rest/repositories/delete-graph-repo';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { ApiError } from '../../../src/domain/errors/api-error';

const mock = new MockAdapter(axios);
const repo = new DeleteGraphRepo();

// TODO: Error handline, 5**/4** statuses

describe('Delete Graph Repo', () => {
    it('should resolve as successfully deleted when response status is 202', async () => {
        mock.onDelete('/graphs/graph-1').reply(202);

        await expect(repo.delete('graph-1')).resolves.toEqual(undefined);
    });

    it('should resolve as successfully deleted when response status is 202', async () => {
        mock.onDelete('/graphs/graph-1').reply(200);

        await expect(repo.delete('graph-1')).rejects.toEqual(
            new Error('Expected status code 202 for Accepted Delete Graph Process but got (200)')
        );
    });

    it('should reject and throw Graph Not Deleted Error when status is not 202', async () => {
        mock.onDelete('/graphs/graph-2').reply(500);

        await expect(repo.delete('graph-2')).rejects.toEqual(new ApiError(500, 'Request failed with status code 500'));
    });
});
