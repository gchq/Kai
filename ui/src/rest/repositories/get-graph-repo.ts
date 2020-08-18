import { RestClient, IApiResponse } from "../rest-client";
import { Graph } from "../../domain/graph";
import { IGraphByIdResponse } from '../http-message-interfaces/response-interfaces';

export class GetGraphRepo { 

    public async get(graphId: string): Promise<Graph> {        
        const response: IApiResponse = await RestClient.get(graphId);
        
        if (response.status !== 200) {
            throw new Error('Something went wrong.');
        }

        const responseBody: IGraphByIdResponse = response.body;

        return new Graph(responseBody.graphId, responseBody.currentState);
    }
}
