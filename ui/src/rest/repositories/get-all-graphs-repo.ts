import { RestClient, IApiResponse } from "../rest-client";
import { IAllGraphsResponse } from "../http-message-interfaces/response-interfaces";
import { Graph } from "../../domain/graph";

export class GetAllGraphsRepo { 

    public async getAll(): Promise<Graph[]> {        
        const response: IApiResponse = await RestClient.get();
        
        if (response.status !== 200) {
            throw new Error();
        }
        
        const responseBody: IAllGraphsResponse = response.body;      
        return responseBody.map((jsonObject: any) => {
            return new Graph(jsonObject.graphId, jsonObject.currentState)
          });
    }
}
