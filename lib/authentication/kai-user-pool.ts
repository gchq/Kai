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



// aws cognito-idp describe-user-pool --user-pool-id eu-west-1_IVt9mrg6V

export class KaiUserPool extends cdk.Construct {

    constructor(scope: cdk.Construct, readonly id: string, props?: cognito.UserPoolProps) {
        super(scope, id);

        // USER POOL
        const userPool = new cognito.UserPool(this, "KaiUserPool");
    }
}
