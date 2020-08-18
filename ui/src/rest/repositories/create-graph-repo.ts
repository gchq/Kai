import { RestClient, IApiResponse } from "../rest-client";
import { ICreateGraphRequestBody } from "../http-message-interfaces/request-interfaces";
import { Schema } from "../../domain/schema";

export class CreateGraphRepo { 

    public async create(graphId: string, administrators: Array<string>, schema: Schema): Promise<void> {
        const httpRequestBody: ICreateGraphRequestBody = {
            graphId: graphId,
            administrators: administrators,
            schema: schema.getSchema(),
        }

        const response: IApiResponse = await RestClient.post(httpRequestBody);

        if (response.status !== 201) {
            throw new Error('Graph was not created.');
        }
    }
}
