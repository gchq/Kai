import { RestClient, IApiResponse } from '../rest-client';

export class DeleteGraphRepo {
    
    public async delete(graphId: string): Promise<void> {
        const response: IApiResponse<undefined> = await RestClient.delete(graphId);

        if (response.status !== 202) {
            throw new Error(`Expected status code 202 for Accepted Delete Graph Process but got (${response.status})`);
        }
    }
}
