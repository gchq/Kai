import { CreateGraphRepo } from "../../../src/rest/repositories/create-graph-repo";
import { Schema } from "../../../src/domain/schema";
import { RestClient } from "../../../src/rest/rest-client";

const restClient = RestClient.post = jest.fn();
const repo = new CreateGraphRepo();

// TODO: Error handline, 5**/4** statuses

describe('Create Graph ', ()=> {
    it('should called with ', async() =>{
        restClient.mockReturnValueOnce({status: 201});
        
        const schema= new Schema(JSON.stringify({ elements: {}, types: {} }));
    
        await expect(repo.create('id', [], schema)).resolves.toEqual(undefined);
    });
    it('should throw unexpected response error, when response status is not 201 ', async() =>{
        restClient.mockReturnValueOnce({status: 500});
        
        const schema= new Schema(JSON.stringify({ elements: {}, types: {} }));
    
        await expect(repo.create('id', [], schema)).rejects.toEqual(Error('Graph was not created.'));
    });
});
