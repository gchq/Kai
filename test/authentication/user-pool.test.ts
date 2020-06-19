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

import { expect as expectCDK, haveResource } from "@aws-cdk/assert";
import * as cdk from "@aws-cdk/core";
import * as cognito from "@aws-cdk/aws-cognito";
import { KaiUserPool} from "../../lib/authentication/user-pool";

test("Should create default UserPool and UserPoolClient", () => {
    // Given
    const stack = new cdk.Stack();

    // When
    new KaiUserPool(stack, "TestUserPool");

    // Then
    expectCDK(stack).to(haveResource("AWS::Cognito::UserPool", {
        "AdminCreateUserConfig": {
            "AllowAdminCreateUserOnly": true
        }
    }));
    expectCDK(stack).to(haveResource("AWS::Cognito::UserPoolClient", {
        "UserPoolId": {
            "Ref": "TestUserPoolKaiUserPool8F9565E7"
        },
        "SupportedIdentityProviders": [
            "COGNITO"
        ]
    }));
});

const userPoolProps = {
    "autoVerify": {
        "email": true
    },
    "selfSignUpEnabled": true
};

const userPoolClientOptions = {
    "generateSecret": true,
    "userPoolClientName": "TestClientName"
};

const userPoolConfigurationWithUserPoolProps = {
    "defaultPoolConfig": {
        "userPoolProps": userPoolProps
    }
};

const userPoolConfigurationWithUserPoolClientOptions = {
    "defaultPoolConfig": {
        "userPoolClientOptions": userPoolClientOptions
    }
};

test("Should apply String UserPoolProps configuration to default User Pool", () => {
    expectUserPoolPropsToBeApplied(JSON.stringify(userPoolConfigurationWithUserPoolProps));
});


test("Should apply Object UserPoolProps configuration to default User Pool", () => {
    expectUserPoolPropsToBeApplied(userPoolConfigurationWithUserPoolProps);
});

function expectUserPoolPropsToBeApplied(userPoolConfiguration: Record<string, unknown> | string) {

    // Given
    const stack = new cdk.Stack();
    stack.node.setContext("userPoolConfiguration", userPoolConfiguration);

    // When
    new KaiUserPool(stack, "TestUserPool");

    // Then
    expectCDK(stack).to(haveResource("AWS::Cognito::UserPool", {
        "AdminCreateUserConfig": {
            "AllowAdminCreateUserOnly": false
        },
        "AutoVerifiedAttributes": [
            "email"
        ]
    }));
}

test("Should apply String UserPoolClientOptions to default User Pool Client", () => {
    expectUserPoolClientOptionsToBeApplied(JSON.stringify(userPoolConfigurationWithUserPoolClientOptions));
});


test("Should apply Object UserPoolClientOptions to default User Pool Client", () => {
    expectUserPoolClientOptionsToBeApplied(userPoolConfigurationWithUserPoolClientOptions);
});

function expectUserPoolClientOptionsToBeApplied(userPoolConfiguration: Record<string, unknown> | string) {

    // Given
    const stack = new cdk.Stack();
    stack.node.setContext("userPoolConfiguration", userPoolConfiguration);

    // When
    new KaiUserPool(stack, "TestUserPool");

    // Then
    expectCDK(stack).to(haveResource("AWS::Cognito::UserPoolClient", {
        "ClientName": "TestClientName",
        "GenerateSecret": true
    }));
}

const externalPool = {
    "userPoolId": "testUserPoolId",
    "userPoolClientId": "testUserPoolClientId"
};

const userPoolConfigurationForExternalPool = {
    "externalPool": externalPool
};

test("Should apply Object external pool configuration", () => {
    expectExternalPoolConfigToBeApplied(userPoolConfigurationForExternalPool);
});

test("Should apply String external pool configuration", () => {
    expectExternalPoolConfigToBeApplied(JSON.stringify(userPoolConfigurationForExternalPool));
});

function expectExternalPoolConfigToBeApplied(userPoolConfiguration: Record<string, unknown> | string) {

    // Given
    const stack = new cdk.Stack();
    stack.node.setContext("userPoolConfiguration", userPoolConfiguration);

    // When
    const userPool: KaiUserPool = new KaiUserPool(stack, "TestUserPool");

    // Then
    expect(userPool.userPoolId).toBe(externalPool.userPoolId);
    expect(userPool.userPoolClientId).toBe(externalPool.userPoolClientId);
}
