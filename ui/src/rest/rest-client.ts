import { API_HOST } from './api-config';
import axios, { AxiosResponse } from 'axios';

export class RestClient {
    public static async get(pathVariable?: string): Promise<IApiResponse> {
        const path = pathVariable ? `/${pathVariable}` : ``;

        const response: AxiosResponse<any> = await axios.get(`${API_HOST}/graphs${path}`);
        
        return this.convert(response);
    }

    public static async post(httpRequestBody: object): Promise<IApiResponse> {
        const response: AxiosResponse<any> = await axios.post(`${API_HOST}/graphs`, httpRequestBody);

        return this.convert(response);
    }

    public static async delete(urlPathVariable: string): Promise<IApiResponse> {
        const response: AxiosResponse<any> = await axios.delete(`${API_HOST}/graphs/${urlPathVariable}`);

        return this.convert(response);
    }

    private static async convert(response: AxiosResponse<any>): Promise<IApiResponse> {
        if (response.status >= 400) {
            throw new Error(`(${response.status}): ${response.statusText}`);
        }

        return {
            status: response.status,
            data: response.data,
        };
    }
}

export interface IApiResponse<T = any> {
    status: number;
    data: T;
}
