import { API_HOST } from './api-config';

export class RestClient {
    
    public static async get(pathVariable?: string): Promise<IApiResponse> {
        const path = pathVariable ? `/${pathVariable}` : ``;

        const response: Response = await fetch(`${API_HOST}/graphs${path}`, {
            method: 'GET',
        });

        return this.convert(response);
    }

    public static async post(httpRequestBody: object): Promise<IApiResponse> {
        const response: Response = await fetch(`${API_HOST}/graphs`, {
            method: 'POST',
            body: JSON.stringify(httpRequestBody),
        });

        return this.convert(response);
    }

    public static async delete(urlPathVariable: string): Promise<IApiResponse> {
        const response: Response = await fetch(`${API_HOST}/graphs/` + urlPathVariable, {
            method: 'DELETE',
        });

        return this.convert(response);
    }

    private static async convert(response: Response): Promise<IApiResponse> {
        if (response.status >= 400) {
            throw new Error(`(${response.status}): ${response.statusText}`);
        }

        return {
            status: response.status,
            body: await response.json(),
        };
    }
}

export interface IApiResponse {
    status: number;
    body: any;
}
