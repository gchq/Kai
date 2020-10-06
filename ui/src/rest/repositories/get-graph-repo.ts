import { RestClient, IApiResponse } from '../rest-client';
import { Graph } from '../../domain/graph';
import { IGraphByIdResponse } from '../http-message-interfaces/response-interfaces';

export class GetGraphRepo {
    public async get(graphName: string): Promise<Graph> {
        const response: IApiResponse<IGraphByIdResponse> = await RestClient.get(graphName);

        return new Graph(response.data.graphName, response.data.currentState);
    }
}
