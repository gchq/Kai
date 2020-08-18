import { RestClient } from "../../../src/rest/rest-client";
import { DeleteGraphRepo } from "../../../src/rest/repositories/delete-graph-repo";

const restClient = RestClient.delete = jest.fn();
const repo = new DeleteGraphRepo();

// TODO: Error handline, 5**/4** statuses

describe('Delete Graph Repo', ()=> {

    it('should resolve when response status is 202', async() =>{
        restClient.mockReturnValueOnce({status: 202});
        
        await expect(repo.delete('graph-1')).resolves.toEqual(undefined);
    });

    it('should reject and throw Graph Not Deleted Error when status is not 202', async() =>{
        restClient.mockReturnValueOnce({status: 500});
        
        await expect(repo.delete('graph-2')).rejects.toEqual(Error('Graph was not deleted'));
    });
});
