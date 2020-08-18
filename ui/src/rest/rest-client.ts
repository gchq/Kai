import { Graph } from '../domain/graph';
import { API_HOST } from './api-config';
import { Schema } from '../domain/schema';
import { ICreateGraphRequestBody } from './http-message-interfaces/request-interfaces';

export class RestClient {

  public static async getAllGraphs(): Promise<Graph[]> {
      const response = await fetch(`${API_HOST}/graphs`);
      const body = await response.json();
      
      if (response.status !== 200) {
        throw Error(body.message) 
      }

      return body.map((jsonObject: any) => {
        return new Graph(jsonObject.graphId, jsonObject.currentState)
      });
  }

  public static async getGraphById(graphId: number): Promise<Graph> {
      const response = await fetch(`${API_HOST}/graphs/` + graphId);
      const body = await response.json();
  
      if (response.status !== 200) {
        throw Error(body.message) 
      }

      return new Graph(body.graphId, body.currentState);
  }

  public static async deleteGraphById(graphId: number): Promise<void> {
    const response = await fetch(`${API_HOST}/graphs/` + graphId, {
      method: 'delete',
    });
    const body = await response.json();
    if (response.status !== 200) {
      throw Error(body.message) 
    }
  }

  public static async createNewGraph(graphId: string, administrators: Array<string>, schema: Schema): Promise<void> {
      const httpRequestBody: ICreateGraphRequestBody = {
          graphId: graphId,
          administrators: administrators,
          schema: schema.getSchema(),
      }

      const response = await fetch(`${API_HOST}/graphs`, {
          method: 'POST',
          body: JSON.stringify(httpRequestBody),
      });
      
      if (response.status !== 201) {
          throw new Error('Graph was not created.');
      }
  }
}
