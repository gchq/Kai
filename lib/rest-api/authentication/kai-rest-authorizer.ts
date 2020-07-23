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

import { Construct } from "@aws-cdk/core";
import { AuthorizationType, CfnAuthorizer, IdentitySource, MethodOptions } from "@aws-cdk/aws-apigateway";
import { KaiRestAuthorizerProps } from "./kai-rest-authorizer-props";

export class KaiRestAuthorizer extends Construct {

    private readonly _authorizer: CfnAuthorizer;

    constructor(scope: Construct, readonly id: string, props: KaiRestAuthorizerProps) {
        super(scope, id);

        const cfnAuthorizerId = "KaiRestApiAuthorizer";

        this._authorizer = new CfnAuthorizer(this, cfnAuthorizerId, {
            restApiId: props.restApiId,
            type: AuthorizationType.COGNITO,
            identitySource: IdentitySource.header("Authorization"),
            name: cfnAuthorizerId,
            providerArns: [
                props.userPoolArn
            ]
        });
    }

    public get methodOptions(): MethodOptions {
        return {
            apiKeyRequired: false,
            authorizer: {
                authorizerId: this._authorizer.ref,
                authorizationType: AuthorizationType.COGNITO
            }
        };
    }
}
