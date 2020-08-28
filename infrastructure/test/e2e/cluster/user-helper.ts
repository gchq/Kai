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

import { IUserPool } from "./cluster-helper";
import { v4 as uuidv4 } from "uuid";
import * as AWS from "aws-sdk";
import { PromiseResult } from "aws-sdk/lib/request";

interface IUser {
    userName: string;
    password: string;
}

export class UserHelper {
    private readonly _stackName: string;
    private readonly _cognitoIdentityServiceProvider: AWS.CognitoIdentityServiceProvider;

    constructor(stackName: string) {
        this._stackName = stackName;
        this._cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({apiVersion: "2016-04-18"});
    }

    public async createUserAuthenticationToken(userPool: IUserPool, userName: string): Promise<string | undefined> {
        const user: IUser = {
            userName: this._stackName + "-" + userName,
            password: uuidv4() + "Q"
        };

        /* Create user */
        await this.createUser(userPool.userPoolId, user).then(
            (data: AWS.CognitoIdentityServiceProvider.AdminCreateUserResponse) => {
                /* Set password */
                return this.setPassword(userPool.userPoolId, user);
            }
        ).then(
            (data: AWS.CognitoIdentityServiceProvider.AdminSetUserPasswordResponse) => {
                /* Enable authentication */
                return this.enableAdminUserPasswordAuthentication(userPool);
            },
        ).then(
            (data: AWS.CognitoIdentityServiceProvider.UpdateUserPoolResponse) => {
                /* Obtain token */
                return this.authenticate(userPool, user);
            },
        ).then(
            (data: AWS.CognitoIdentityServiceProvider.InitiateAuthResponse) => {
                if (data.AuthenticationResult && data.AuthenticationResult.AccessToken) {
                    return data.AuthenticationResult.AccessToken;
                } else {
                    throw new Error("No Token returned");
                }
            },
        ).catch((error) => {
            console.log(error.message);
        });

        return undefined;
    }

    private createUser(userPoolId: string, user: IUser): Promise<PromiseResult<AWS.CognitoIdentityServiceProvider.AdminCreateUserResponse, AWS.AWSError>> {
        const params = {
            UserPoolId: userPoolId,
            Username: user.userName
        };
        console.log("Creating user with params: " +  JSON.stringify(params));
        return this._cognitoIdentityServiceProvider.adminCreateUser(params).promise();
    }

    private setPassword(userPoolId: string, user: IUser): Promise<PromiseResult<AWS.CognitoIdentityServiceProvider.AdminSetUserPasswordResponse, AWS.AWSError>> {
        const params = {
            Password: user.password,
            UserPoolId: userPoolId,
            Username: user.userName,
            Permanent: true
        };
        console.log("Setting password with params: " +  JSON.stringify(params));
        return this._cognitoIdentityServiceProvider.adminSetUserPassword(params).promise();
    }

    private enableAdminUserPasswordAuthentication(userPool: IUserPool): Promise<PromiseResult<AWS.CognitoIdentityServiceProvider.UpdateUserPoolResponse, AWS.AWSError>> {
        const params = {
            ClientId: userPool.userPoolClientId,
            UserPoolId: userPool.userPoolId,
            ExplicitAuthFlows: [
                "ALLOW_ADMIN_USER_PASSWORD_AUTH",
                "ALLOW_REFRESH_TOKEN_AUTH"
            ]
        };
        console.log("Enabling Admin User Password Authentication with params: " +  JSON.stringify(params));
        return this._cognitoIdentityServiceProvider.updateUserPoolClient(params).promise();
    }

    private authenticate(userPool: IUserPool, user: IUser): Promise<PromiseResult<AWS.CognitoIdentityServiceProvider.InitiateAuthResponse, AWS.AWSError>> {
        const params = {
            AuthFlow: "ADMIN_USER_PASSWORD_AUTH",
            ClientId: userPool.userPoolClientId,
            UserPoolId: userPool.userPoolId,
            AuthParameters: {
                USERNAME: user.userName,
                PASSWORD: user.password
            }
        };
        console.log("Authenticating: " +  JSON.stringify(params));
        return this._cognitoIdentityServiceProvider.adminInitiateAuth(params).promise();
    }
}
