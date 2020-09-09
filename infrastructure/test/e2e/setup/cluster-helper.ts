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

import * as cp from "child_process";
import * as fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { SecurityGroupHelper } from "./security-group-helper";
import { IUserToken, UserHelper } from "./user-helper";

interface IClusterOutputs {
    clusterName: string;
    restApiEndpoint: string;
    kubeConfigCommand: string;
    userPool: IUserPool;
}

export interface IUserPool {
    userPoolId: string;
    userPoolClientId: string;
}


export class ClusterHelper {
    private readonly _uuid: string = uuidv4();
    private readonly _stackName: string = "KaiE2eTesting-" + this._uuid;
    private readonly _outputsFileName: string = this._stackName + "-outputs.json";
    private readonly _testUser: string = this._stackName + "-TestUser";
    private readonly _securityGroupHelper: SecurityGroupHelper = new SecurityGroupHelper(this._stackName);
    private readonly _userHelper: UserHelper = new UserHelper(this._stackName);
    private readonly _userTokens: Record<string, IUserToken> = {};

    private _clusterName: string;
    private _restApiEndpoint: string;
    private _userPool: IUserPool;
    private _securityGroupId: string | void;

    public async deployCluster(users: string[]): Promise<void> {

        try {

            this._securityGroupId = await this._securityGroupHelper.createSecurityGroup();

            /*
             * Programmatic deployment not available: https://github.com/aws/aws-cdk/issues/601
             */
            const deployCommand = "cdk deploy --context stackName=" + this._stackName + " --require-approval never --outputs-file " + this._outputsFileName;
            console.log("Deploying stack: " + this._stackName + " using command: " + deployCommand);
            cp.execSync(deployCommand);

            const clusterOutputs: IClusterOutputs = this.parseOutputsFile();

            this._restApiEndpoint = clusterOutputs.restApiEndpoint;
            this._userPool = clusterOutputs.userPool;
            this._clusterName = clusterOutputs.clusterName;

            await this.createUsers(users);

        } catch (error) {
            throw new Error("Problem deploying cluster, received error: " + error);
        }
    }

    public async destroyCluster(): Promise<void> {
        if (this._securityGroupId) {
            await this._securityGroupHelper.deleteSecurityGroup(this._securityGroupId);
        }

        const destroyCommand = "cdk destroy --context stackName=" + this._stackName + " --force";
        console.log("Destroying stack: " + this._stackName + " using command: " + destroyCommand);
        cp.execSync(destroyCommand);
    }

    private async createUsers(users: string[]): Promise<void> {
        for (const user of users) {
            const token: IUserToken | void = await this._userHelper.createUserAuthenticationToken(this._userPool, user);
            if (token) {
                this._userTokens[user] = token;
            }
        }
    }

    private parseOutputsFile(): IClusterOutputs {
        const json = JSON.parse(fs.readFileSync(this._outputsFileName, "utf8"));

        let clusterName;
        let kubeConfigCommand;
        let restApiEndpoint;
        let userPoolId;
        let userPoolClientId;

        if (this._stackName in json) {
            for (const key in json[this._stackName]) {
                if (key.startsWith("GraphPlatformEksClusterConfigCommand")) {
                    kubeConfigCommand = json[this._stackName][key];
                }
                if (key.startsWith("GraphPlatformKaiEksClusterName")) {
                    clusterName = json[this._stackName][key];
                }
                if (key.includes(this._stackName.replace(/-/g, "")) && key.includes("KaiRestApi") && key.includes("RestApiEndpoint")) {
                    restApiEndpoint = json[this._stackName][key];
                }
                if (key.startsWith("KaiUserPoolKaiUserPoolId")) {
                    userPoolId = json[this._stackName][key];
                }
                if (key.startsWith("KaiUserPoolKaiUserPoolClientId")) {
                    userPoolClientId = json[this._stackName][key];
                }
            }
        }

        if (!kubeConfigCommand
               || !clusterName
               || !restApiEndpoint
               || !userPoolId
               || !userPoolClientId) {
            throw new Error("Incomplete cluster output, unable to continue.");
        }

        return {
            clusterName: clusterName,
            kubeConfigCommand: kubeConfigCommand,
            restApiEndpoint: restApiEndpoint,
            userPool: {
                userPoolId: userPoolId,
                userPoolClientId: userPoolClientId
            }
        };
    }

    public get clusterName(): string {
        return this._clusterName;
    }

    public get restApiEndpoint(): string {
        return this._restApiEndpoint;
    }

    public get stackName(): string {
        return this._stackName;
    }

    public get userPool(): IUserPool {
        return this._userPool;
    }

    public get userTokens(): Record<string, IUserToken> {
        return this._userTokens;
    }
}
