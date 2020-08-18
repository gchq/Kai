import { CreateGraphRepo } from "../../../src/rest/repositories/create-graph-repo";
import { Schema } from "../../../src/domain/schema";
import { RestClient } from "../../../src/rest/rest-client";
import { DeleteGraphRepo } from "../../../src/rest/repositories/delete-graph-repo";

const restClient = RestClient.delete = jest.fn();
const repo = new DeleteGraphRepo();

// TODO: Error handline, 5**/4** statuses

describe('Create Graph ', ()=> {
    it('should called with ', async() =>{
        restClient.mockReturnValueOnce({status: 202});
        
        await expect(repo.delete('graph-1')).resolves.toEqual(undefined);
    });
    it('should throw unexpected response error, when response status is not 201 ', async() =>{
        restClient.mockReturnValueOnce({status: 500});
        
        const schema= new Schema(JSON.stringify({ elements: {}, types: {} }));
    
        await expect(repo.delete('graph-2')).rejects.toEqual(Error('Graph was not deleted'));
    });
});
