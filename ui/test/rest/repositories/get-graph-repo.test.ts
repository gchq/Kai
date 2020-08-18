import { RestClient } from "../../../src/rest/rest-client";
import { GetGraphRepo } from "../../../src/rest/repositories/get-graph-repo";
import { Graph } from "../../../src/domain/graph";

const restClient = RestClient.get = jest.fn();
const repo = new GetGraphRepo();

// TODO: Error handline, 5**/4** statuses

describe('Get Graph By Id', () => {

    it('should return one graph when request is successful', async () => {
        restClient.mockReturnValueOnce({status: 200, body: { graphId: 'graph-1', currentState: 'DEPLOYED'} });
        
        const actual: Graph = await repo.get('graph-1');

        const expected: Graph = new Graph('graph-1', 'DEPLOYED');
        expect(actual).toEqual(expected);
    });

    it('should reject and throw unexpected response error, when response status is not 201 ', async () => {
        restClient.mockReturnValueOnce({status: 500});

        await expect(repo.get('graph-2')).rejects.toEqual(new Error('Something went wrong.'));
    });
});
