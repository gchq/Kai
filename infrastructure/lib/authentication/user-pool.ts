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

import * as cdk from "@aws-cdk/core";
import * as cognito from "@aws-cdk/aws-cognito";
import { UserPoolConfig } from "./user-pool-config";

export class KaiUserPool extends cdk.Construct {

    private static readonly _userPoolId = "KaiUserPool";
    private static readonly _userPoolClientId = "KaiUserPoolClient";

    private readonly _userPool: cognito.IUserPool;
    private readonly _userPoolClient: cognito.IUserPoolClient;

    constructor(scope: cdk.Construct, readonly id: string) {
        super(scope, id);

        let userPoolConfiguration = this.node.tryGetContext("userPoolConfiguration");
        let userPoolConfig: UserPoolConfig;

        if (userPoolConfiguration) {
            if (typeof userPoolConfiguration == "string") {
                userPoolConfiguration = JSON.parse(userPoolConfiguration);
            }
            userPoolConfig = UserPoolConfig.fromConfig(userPoolConfiguration);
        } else {
            userPoolConfig = UserPoolConfig.DEFAULT;
        }

        if (userPoolConfig.useExternalPool && userPoolConfig.externalPool) {

            this._userPool = cognito.UserPool.fromUserPoolId(this, KaiUserPool._userPoolId, userPoolConfig.externalPool.userPoolId);
            this._userPoolClient = cognito.UserPoolClient.fromUserPoolClientId(this, KaiUserPool._userPoolClientId, userPoolConfig.externalPool.userPoolClientId);

        } else {

            let userPoolProps: cognito.UserPoolProps = {};
            if (userPoolConfig.defaultPoolConfig && userPoolConfig.defaultPoolConfig.userPoolProps) {
                userPoolProps = userPoolConfig.defaultPoolConfig.userPoolProps;
            }

            this._userPool = new cognito.UserPool(this, KaiUserPool._userPoolId, userPoolProps);

            const userPoolClientProps: cognito.UserPoolClientProps = { "userPool": this._userPool };
            if (userPoolConfig.defaultPoolConfig && userPoolConfig.defaultPoolConfig.userPoolClientOptions) {
                Object.assign(userPoolClientProps, userPoolConfig.defaultPoolConfig.userPoolClientOptions);
            }

            this._userPoolClient = this._userPool.addClient(KaiUserPool._userPoolClientId, userPoolClientProps);
        }

        /* Add a custom output containing the User Pool Id */
        new cdk.CfnOutput(this, "KaiUserPoolId", {
            value: this.userPoolId
        });

        /* Add a custom output containing the User Pool Client Id */
        new cdk.CfnOutput(this, "KaiUserPoolClientId", {
            value: this.userPoolClientId
        });
    }

    public get userPoolArn(): string {
        return this._userPool.userPoolArn;
    }

    public get userPoolId(): string {
        return this._userPool.userPoolId;
    }

    public get userPoolClientId(): string {
        return this._userPoolClient.userPoolClientId;
    }
}
