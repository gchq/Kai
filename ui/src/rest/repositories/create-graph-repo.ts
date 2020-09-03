import { RestClient, IApiResponse } from '../rest-client';
import { ICreateGraphRequestBody } from '../http-message-interfaces/request-interfaces';
import { Schema } from '../../domain/schema';

export class CreateGraphRepo {

    public async create(graphName: string, administrators: Array<string>, schema: Schema): Promise<void> {
        const httpRequestBody: ICreateGraphRequestBody = {
            graphName: graphName,
            administrators: administrators,
            schema: schema.getSchema(),
        };

        const response: IApiResponse<undefined> = await RestClient.post(httpRequestBody);

        if (response.status !== 201) {
            throw new Error(`Expected status code 201 for Created Graph but got (${response.status})`);
        }
    }
}
