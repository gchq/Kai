import { RestClient, IApiResponse } from "../rest-client";

export class DeleteGraphRepo { 

    public async delete(graphId: string): Promise<void> {        
        const response: IApiResponse = await RestClient.delete(graphId);
        
        if (response.status !== 202) {
            throw new Error('Graph was not deleted');
        }
    }
}
