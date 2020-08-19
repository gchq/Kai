import { RestClient } from '../../../src/rest/rest-client';
import { GetAllGraphsRepo } from '../../../src/rest/repositories/get-all-graphs-repo';
import { Graph } from '../../../src/domain/graph';

const restClient = (RestClient.get = jest.fn());
const repo = new GetAllGraphsRepo();

// TODO: Error handline, 5**/4** statuses

describe('Get All Graphs Repo', () => {
    it('should return many Graphs when api returns many', async () => {
        const apiResponse = {
            status: 200,
            body: [
                {
                    graphId: 'roadTraffic',
                    currentState: 'DEPLOYED',
                },
                {
                    graphId: 'basicGraph',
                    currentState: 'DELETION_QUEUED',
                },
            ],
        };
        restClient.mockReturnValueOnce(apiResponse);

        const actual: Graph[] = await repo.getAll();

        const expected = [new Graph('roadTraffic', 'DEPLOYED'), new Graph('basicGraph', 'DELETION_QUEUED')];
        expect(actual).toEqual(expected);
    });

    it('should return one Graph when api returns one', async () => {
        const apiResponse = {
            status: 200,
            body: [
                {
                    graphId: 'streetTraffic',
                    currentState: 'DELETION_QUEUED',
                },
            ],
        };
        restClient.mockReturnValueOnce(apiResponse);

        const actual: Graph[] = await repo.getAll();

        const expected = [new Graph('streetTraffic', 'DELETION_QUEUED')];
        expect(actual).toEqual(expected);
    });
});
