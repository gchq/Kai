import { Graph } from '../domain/graph';
import { API_HOST } from './api-config';

export class RestClient {

    public static async getGraphById(graphId: number): Promise<Graph> {
        const response = await fetch(`${API_HOST}/graphs/` + graphId);
        const body = await response.json();
    
        if (response.status !== 200) {
          throw Error(body.message) 
        }

        return new Graph(body.graphId, body.currentState);
    }

    public static async get(): Promise<IApiResponse> {
      const response: Response = await fetch(`${API_HOST}/graphs`, {
        method: 'GET',
      });

      return {
        status: response.status,
        body: await response.json(),
      }
    }

    public static async post(httpRequestBody: object): Promise<IApiResponse> {
        const response: Response = await fetch(`${API_HOST}/graphs`, {
            method: 'POST',
            body: JSON.stringify(httpRequestBody),
        });

        return {
          status: response.status,
          body: await response.json(),
        }
    }

    public static async delete(urlPathVariable: string): Promise<IApiResponse> {
        const response: Response = await fetch(`${API_HOST}/graphs/` + urlPathVariable, {
            method: 'DELETE',
        });

        return {
          status: response.status,
          body: await response.json(),
        }
    }
}

export interface IApiResponse {
  status: number,
  body: any,
}
