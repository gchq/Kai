/*
 * Copyright 2020 Crown Copyright
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import axios, { AxiosRequestConfig, AxiosResponse, Method } from "axios";
import { IUserToken } from "../setup/user-helper";

const graphDeploymentCheckIntervalMilliseconds: number = 10 * 1000;
const graphDeletionCheckIntervalMilliseconds: number = 10 * 1000;

const namespaceDeploymentCheckIntervalMilliseconds: number = 10 * 1000;
const namespaceDeletionCheckIntervalMilliseconds: number = 10 * 1000;

export interface IResponse {
    status: number,
    data: Record<string, undefined>
}

export class RestApiClient {
    private readonly _graphs = "/graphs";
    private readonly _namespaces = "/namespaces";
    private readonly _restApiEndpoint: string;
    private readonly _userTokens: Record<string, IUserToken>;

    constructor(restApiEndpoint: string, userTokens: Record<string, IUserToken>) {
        this._restApiEndpoint = restApiEndpoint;
        this._userTokens = userTokens;
    }

    public getGraphs(userName: string): Promise<IResponse> {
        return this.callApi("get", this._graphs, userName, undefined);
    }

    public getNamespaceGraph(userName: string, namespaceName: string, graphName: string): Promise<IResponse> {
        const url = this._namespaces + "/" + namespaceName + this._graphs + "/" + graphName;
        return this.callApi("get", url, userName, undefined);
    }

    public createGraph(userName: string, data: Record<string, unknown>): Promise<IResponse> {
        return this.callApi("post", this._graphs, userName, data);
    }

    public deleteNamespaceGraph(userName: string, namespaceName: string, graphName: string): Promise<IResponse> {
        const url = this._namespaces + "/" + namespaceName + this._graphs + "/" + graphName;
        return this.callApi("delete", url, userName, undefined);
    }

    public async awaitGraphDeployment(userName: string, namespaceName: string, graphName: string, timeoutMilliseconds: number): Promise<boolean> {
        const startTime = new Date().getTime();
        while (new Date().getTime() - startTime < timeoutMilliseconds) {
            const deploymentStatus: string | undefined = await this.getNamespaceGraph(userName, namespaceName, graphName).then(
                (response: IResponse) => {
                    console.log("Awaiting graph deployment, received response: " + JSON.stringify(response.data));
                    if (response.data["currentState"]) {
                        return response.data["currentState"];
                    } else {
                        return "NOT SET";
                    }
                }
            );
            if (deploymentStatus) {
                switch (deploymentStatus) {
                case "DEPLOYED": {
                    return true;
                }
                case "DEPLOYMENT_FAILED": {
                    return false;
                }
                default:
                    break;
                }
            }
            await new Promise(r => setTimeout(r, graphDeploymentCheckIntervalMilliseconds));
        }
        console.log("Timed out awaiting graph deployment");
        return false;
    }


    public async awaitGraphDeletion(userName: string, namespaceName: string, graphName: string, timeoutMilliseconds: number): Promise<boolean> {
        const startTime = new Date().getTime();
        while (new Date().getTime() - startTime < timeoutMilliseconds) {
            const deleted: boolean | undefined = await this.getNamespaceGraph(userName, namespaceName, graphName).then(
                (response: IResponse) => {
                    console.log("Awaiting graph deletion, received response: " + JSON.stringify(response));
                    return (response.status == 404);
                }
            );
            if (deleted) {
                return true;
            }
            await new Promise(r => setTimeout(r, graphDeletionCheckIntervalMilliseconds));
        }
        console.log("Timed out awaiting graph deletion");
        return false;
    }

    public getNamespaces(userName: string): Promise<IResponse> {
        return this.callApi("get", this._namespaces, userName, undefined);
    }

    public getNamespace(userName: string, namespaceName: string): Promise<IResponse> {
        const url = this._namespaces + "/" + namespaceName;
        return this.callApi("get", url, userName, undefined);
    }

    public createNamespace(userName: string, data: Record<string, unknown>): Promise<IResponse> {
        return this.callApi("post", this._namespaces, userName, data);
    }

    public updateNamespace(userName: string, namespaceName: string, data: Record<string, unknown>): Promise<IResponse> {
        const url = this._namespaces + "/" + namespaceName;
        return this.callApi("post", url, userName, data);
    }

    public deleteNamespace(userName: string, namespaceName: string): Promise<IResponse> {
        const url = this._namespaces + "/" + namespaceName;
        return this.callApi("delete", url, userName, undefined);
    }

    public async awaitNamespaceDeployment(userName: string, namespaceName: string, timeoutMilliseconds: number): Promise<boolean> {
        const startTime = new Date().getTime();
        while (new Date().getTime() - startTime < timeoutMilliseconds) {
            const deploymentStatus: string | undefined = await this.getNamespace(userName, namespaceName).then(
                (response: IResponse) => {
                    console.log("Awaiting namespace deployment, received response: " + JSON.stringify(response.data));
                    if (response.data["currentState"]) {
                        return response.data["currentState"];
                    } else {
                        return "NOT SET";
                    }
                }
            );
            if (deploymentStatus) {
                switch (deploymentStatus) {
                case "DEPLOYED": {
                    return true;
                }
                case "DEPLOYMENT_FAILED": {
                    return false;
                }
                default:
                    break;
                }
            }
            await new Promise(r => setTimeout(r, namespaceDeploymentCheckIntervalMilliseconds));
        }
        console.log("Timed out awaiting namespace deployment");
        return false;
    }

    public async awaitNamespaceDeletion(userName: string, namespaceName: string, timeoutMilliseconds: number): Promise<boolean> {
        const startTime = new Date().getTime();
        while (new Date().getTime() - startTime < timeoutMilliseconds) {
            const deleted: boolean | undefined = await this.getNamespace(userName, namespaceName).then(
                (response: IResponse) => {
                    console.log("Awaiting namespace deletion, received response: " + JSON.stringify(response));
                    return (response.status == 404);
                }
            );
            if (deleted) {
                return true;
            }
            await new Promise(r => setTimeout(r, namespaceDeletionCheckIntervalMilliseconds));
        }
        console.log("Timed out awaiting namespace deletion");
        return false;
    }

    private callApi(method: Method, url: string, userName: string, data: Record<string, unknown> | undefined): Promise<IResponse> {
        return axios(
            this.createRequestConfig(method, url, userName, data)
        ).then(
            (response: AxiosResponse) => {
                return {
                    status: response.status,
                    data: <Record<string, undefined>>response.data
                };
            },
        ).catch(
            (error) => {
                if (error.response) {
                    // The request was made and the server responded with a status code that falls out of the range of 2xx
                    return {
                        status: error.response.status,
                        data: <Record<string, undefined>>error.response.data
                    };
                } else if (error.request) {
                    throw new Error("No response received, original request: " + error.request);
                } else {
                    throw new Error("Error received while creating request: " + error.message);
                }
            }
        );
    }

    private createRequestConfig(method: Method, url: string, userName: string, data: Record<string, unknown> | undefined): AxiosRequestConfig {
        const config: AxiosRequestConfig = {
            method: method,
            responseType: "json",
            headers: {"Authorization": this._userTokens[userName].token},
            baseURL: this._restApiEndpoint,
            url: url
        };
        if (data) {
            config.data = data;
        }
        return config;
    }
}
