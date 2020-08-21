import { GetGraphRepo } from '../../../src/rest/repositories/get-graph-repo';
import { Graph } from '../../../src/domain/graph';
import { IGraphByIdResponse } from '../../../src/rest/http-message-interfaces/response-interfaces';
import MockAdapter from 'axios-mock-adapter';
import { ApiError } from '../../../src/domain/errors/api-error';
import axios from 'axios';

const mock = new MockAdapter(axios);
const repo = new GetGraphRepo();

beforeAll(() => {
    const apiResponse: IGraphByIdResponse = { graphId: 'graph-1', currentState: 'DEPLOYED' };
    mock.onGet('/graphs/graph-1').reply(200, apiResponse);
    mock.onGet('/graphs/notfound-graph').reply(404);
});

afterAll(() => mock.resetHandlers());

describe('Get Graph By Id Repo', () => {
    it('should return one graph when request is successful', async () => {
        const actual: Graph = await repo.get('graph-1');

        const expected: Graph = new Graph('graph-1', 'DEPLOYED');
        expect(actual).toEqual(expected);
    });

    it('should bubble up exception from rest call if graph not found', async () => {
        await expect(repo.get('notfound-graph')).rejects.toThrow(new ApiError(404, 'Request failed with status code 404'));
    });
});
