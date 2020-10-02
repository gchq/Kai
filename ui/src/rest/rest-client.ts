import { API_HOST } from './api-config';
import axios, { AxiosResponse } from 'axios';
import { ApiError } from '../domain/errors/api-error';

export class RestClient {
    private static jwtToken: string;

    public static setJwtToken(jwtToken: string) {
        this.jwtToken = jwtToken;
    }

    public static async get(pathVariable?: string): Promise<IApiResponse> {
        const path = pathVariable ? `/${pathVariable}` : ``;

        try {
            const response: AxiosResponse<any> = await axios.get(`${API_HOST}/graphs${path}`, {
                headers: { Authorization: this.jwtToken },
            });
            return this.convert(response);
        } catch (e) {
            throw new ApiError(e.response.status, e.message);
        }
    }

    public static async post(httpRequestBody: object): Promise<IApiResponse> {
        try {
            const response: AxiosResponse<any> = await axios.post(`${API_HOST}/graphs`, httpRequestBody, {
                headers: { Authorization: this.jwtToken },
            });
            return this.convert(response);
        } catch (e) {
            throw new ApiError(e.response.status, e.message);
        }
    }

    public static async delete(urlPathVariable: string): Promise<IApiResponse> {
        try {
            const response: AxiosResponse<any> = await axios.delete(`${API_HOST}/graphs/${urlPathVariable}`, {
                headers: { Authorization: this.jwtToken },
            });
            return this.convert(response);
        } catch (e) {
            throw new ApiError(e.response.status, e.message);
        }
    }

    private static async convert(response: AxiosResponse<any>): Promise<IApiResponse> {
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
