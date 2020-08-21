import { GetAllGraphsRepo } from '../../../src/rest/repositories/get-all-graphs-repo';
import { Graph } from '../../../src/domain/graph';
import { IAllGraphsResponse } from '../../../src/rest/http-message-interfaces/response-interfaces';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { ApiError } from '../../../src/domain/errors/api-error';

const mock = new MockAdapter(axios);
const repo = new GetAllGraphsRepo();

afterEach(() => mock.resetHandlers());

describe('Get All Graphs Repo', () => {
    it('should return many Graphs when api returns many', async () => {
        const apiResponse: IAllGraphsResponse = [
            {
                graphId: 'roadTraffic',
                currentState: 'DEPLOYED',
            },
            {
                graphId: 'basicGraph',
                currentState: 'DELETION_QUEUED',
            },
        ];
        mock.onGet('/graphs').reply(200, apiResponse);

        const actual: Graph[] = await repo.getAll();

        const expected = [new Graph('roadTraffic', 'DEPLOYED'), new Graph('basicGraph', 'DELETION_QUEUED')];
        expect(actual).toEqual(expected);
    });

    it('should return one Graph when api returns one', async () => {
        const apiResponse: IAllGraphsResponse = [
            {
                graphId: 'streetTraffic',
                currentState: 'DELETION_QUEUED',
            },
        ];
        mock.onGet('/graphs').reply(200, apiResponse);

        const actual: Graph[] = await repo.getAll();

        const expected = [new Graph('streetTraffic', 'DELETION_QUEUED')];
        expect(actual).toEqual(expected);
    });

    it('should bubble up exception from rest call', async () => {
        mock.onGet('/graphs').reply(404);

        await expect(repo.getAll()).rejects.toThrow(
            new ApiError(404, 'Request failed with status code 404')
        );
    });
});
