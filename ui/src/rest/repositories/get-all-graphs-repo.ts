import { RestClient, IApiResponse } from '../rest-client';
import { IAllGraphsResponse } from '../http-message-interfaces/response-interfaces';
import { Graph } from '../../domain/graph';

export class GetAllGraphsRepo {
    
    public async getAll(): Promise<Graph[]> {
        const response: IApiResponse<IAllGraphsResponse> = await RestClient.get();

        if (response.status !== 200) {
            throw new Error(`Error (${response.status}): Unable to get response`);
        }

        return response.data.map((jsonObject: any) => {
            return new Graph(jsonObject.graphId, jsonObject.currentState);
        });
    }
}
