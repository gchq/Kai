import { RestClient, IApiResponse } from '../rest-client';
import { Graph } from '../../domain/graph';
import { IGraphByIdResponse } from '../http-message-interfaces/response-interfaces';

export class GetGraphRepo {
    public async get(graphId: string): Promise<Graph> {
        const response: IApiResponse<IGraphByIdResponse> = await RestClient.get(graphId);

        return new Graph(response.data.graphId, response.data.currentState);
    }
}
