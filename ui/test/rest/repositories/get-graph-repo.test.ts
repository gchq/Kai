import { RestClient, IApiResponse } from '../../../src/rest/rest-client';
import { GetGraphRepo } from '../../../src/rest/repositories/get-graph-repo';
import { Graph } from '../../../src/domain/graph';
import { IGraphByIdResponse } from '../../../src/rest/http-message-interfaces/response-interfaces';

const restClient = (RestClient.get = jest.fn());
const repo = new GetGraphRepo();

// TODO: Error handline, 5**/4** statuses

describe('Get Graph By Id', () => {
    it('should return one graph when request is successful', async () => {
        const response: IApiResponse<IGraphByIdResponse> = {
            status: 200,
            data: { graphId: 'graph-1', currentState: 'DEPLOYED' },
        }
        restClient.mockReturnValueOnce(response);

        const actual: Graph = await repo.get('graph-1');

        const expected: Graph = new Graph('graph-1', 'DEPLOYED');
        expect(actual).toEqual(expected);
    });
});
