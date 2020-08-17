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

interface IClusterOutputs {
    restApiEndpoint: string;
    kubeConfigCommand: string;
    userPool: IUserPool;
}

export interface IUserPool {
    userPoolId: string;
    userPoolClientId: string;
}


export class ClusterHelper {
    //private readonly _uuid: string = uuidv4();
    private readonly _uuid: string = "316dce26-54b9-49a5-aa92-d49f3a1652cf";
    private readonly _stackName: string = "KaiE2eTesting-" + this._uuid;
    private readonly _outputsFileName: string = this._stackName + "-outputs.json";
    private readonly _testUser: string = this._stackName + "-TestUser";
    private readonly _securityGroupHelper: SecurityGroupHelper = new SecurityGroupHelper(this._stackName);

    private _readApiEndpoint: string;
    private _userPool: IUserPool;
    private _securityGroupId: string | undefined;

    public async deployCluster(): Promise<void> {
        /*
         * Programmatic deployment not available: https://github.com/aws/aws-cdk/issues/601
         */
        console.log("Creating security group for stack: " + this._stackName);
        this._securityGroupId = await this._securityGroupHelper.createSecurityGroup();

        console.log("Deploying stack: " + this._stackName);
        const deployCommand="cdk deploy --context stackName=" + this._stackName + " --require-approval never --outputs-file " + this._outputsFileName;
        console.log(deployCommand);
        //cp.execSync(deployCommand);

        const clusterOutputs: IClusterOutputs = this.parseOutputsFile();

        this._readApiEndpoint = clusterOutputs.restApiEndpoint;
        this._userPool = clusterOutputs.userPool;
    }

    public async destroyCluster(): Promise<void> {
        if (this._securityGroupId) {
            console.log("Deleting security group: " + this._securityGroupId);
            await this._securityGroupHelper.deleteSecurityGroup(this._securityGroupId);
        }

        console.log("Destroying stack: " + this._stackName);
        const destroyCommand="cdk destroy --context stackName=" + this._stackName + " --force";
        console.log(destroyCommand);
        //cp.execSync(destroyCommand);
    }

    private parseOutputsFile(): IClusterOutputs {
        const json = JSON.parse(fs.readFileSync(this._outputsFileName, "utf8"));

        let kubeConfigCommand;
        let restApiEndpoint;
        let userPoolId;
        let userPoolClientId;

        if (this._stackName in json) {
            for (const key in json[this._stackName]) {
                if (key.startsWith("GraphPlatformEksClusterConfigCommand")) {
                    kubeConfigCommand = json[this._stackName][key];
                }
                if (key.search(this._stackName.replace(/-/g, "")) > -1 && key.search("KaiRestApi") > -1 && key.search("RestApiEndpoint") > -1) {
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
               || !restApiEndpoint
               || !userPoolId
               || !userPoolClientId) {
            throw new Error("Incomplete cluster output, unable to continue.");
        }

        return {
            kubeConfigCommand: kubeConfigCommand,
            restApiEndpoint: restApiEndpoint,
            userPool: {
                userPoolId: userPoolId,
                userPoolClientId: userPoolClientId
            }
        };
    }

    public get stackName(): string {
        return this._stackName;
    }

    public get userPool(): IUserPool {
        return this._userPool;
    }
}
