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

import axios, { AxiosResponse, Method } from "axios";
import schema from "../config/schema.json";

export interface IResponse {
    status: number,
    data: Record<string, undefined>
}

export class RestApiClient {
    private readonly _graphs = "/graphs";
    private readonly _restApiEndpoint: string;
    private readonly _userTokens: Record<string, string>;

    constructor(restApiEndpoint: string, userTokens: Record<string, string>) {
        this._restApiEndpoint = restApiEndpoint;
        this._userTokens = userTokens;
    }

    public getGraphs(userName: string): Promise<IResponse> {
        return this.callApi("get", this._graphs, userName, undefined);
    }

    public getGraph(userName: string, graphName: string): Promise<IResponse> {
        const url = this._graphs + "/" + graphName;
        return this.callApi("get", url, userName, undefined);
    }

    public createGraph(userName: string, graphName: string): Promise<IResponse> {
        schema.graphName = graphName;
        return this.callApi("post", this._graphs, userName, schema);
    }

    public async awaitGraphDeployment(userName: string, graphName: string, timeoutMilliseconds: number): Promise<boolean> {

        const startTime = new Date().getTime();
        while (new Date().getTime() - startTime < timeoutMilliseconds) {
            const deploymentStatus: string | undefined = await this.getGraph(userName, graphName).then(
                (response: IResponse) => {
                    console.log(JSON.stringify(response.data));
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
            console.log("Sleeping.............................");
            await new Promise(r => setTimeout(r, 10000));
        }
        console.log("Timed out awaiting graph deployment");
        return false;
    }

    private callApi(method: Method, url: string, userName: string, data: object | undefined): Promise<IResponse> {
        return axios({
            method: method,
            responseType: "json",
            headers: {"Authorization": this._userTokens[userName]},
            baseURL: this._restApiEndpoint,
            url: url,
            data: data
        }).then(
            (response: AxiosResponse) => {
                return {
                    status: response.status,
                    data: <Record<string, undefined>>response.data
                };
            }
        );
    }
}