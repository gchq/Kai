import { RestClient, IApiResponse } from '../rest-client';
import { IAllGraphsResponse } from '../http-message-interfaces/response-interfaces';
import { Graph } from '../../domain/graph';

export class GetAllGraphsRepo {
    
    public async getAll(): Promise<Graph[]> {
        const response: IApiResponse<IAllGraphsResponse> = await RestClient.get();

        return response.data.map((jsonObject: any) => {
            return new Graph(jsonObject.graphName, jsonObject.currentState);
        });
    }
}
