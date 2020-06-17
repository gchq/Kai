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
        "GenerateSecret": false
    }));
});

const userPoolConfigOverrides = {
    "AutoVerifiedAttributes": ["email"],
    "EmailConfiguration": {
        "EmailSendingAccount": "COGNITO_DEFAULT"
    },
    "AdminCreateUserConfig": {
      "AllowAdminCreateUserOnly": false
    }
};

const userPoolClientConfigOverrides = {
    "GenerateSecret": true,
    "ClientName": "TestClientName"
};

const userPoolConfigurationWithUserPoolConfigOverrides = {
    "defaultPoolConfigOverrides": {
        "userPoolConfigOverrides": userPoolConfigOverrides
    }
};

const userPoolConfigurationWithUserPoolClientConfigOverrides = {
    "defaultPoolConfigOverrides": {
        "userPoolClientConfigOverrides": userPoolClientConfigOverrides
    }
};

test("Should apply String User Pool configuration overrides to default User Pool", () => {
    expectUserPoolConfigOverridesToBeApplied(JSON.stringify(userPoolConfigurationWithUserPoolConfigOverrides));
});


test("Should apply Object User Pool configuration overrides to default User Pool", () => {
    expectUserPoolConfigOverridesToBeApplied(userPoolConfigurationWithUserPoolConfigOverrides);
});

function expectUserPoolConfigOverridesToBeApplied(userPoolConfiguration: Record<string, unknown> | string) {

    // Given
    const stack = new cdk.Stack();
    stack.node.setContext("userPoolConfiguration", userPoolConfiguration);

    // When
    new KaiUserPool(stack, "TestUserPool");

    // Then
    expectCDK(stack).to(haveResource("AWS::Cognito::UserPool", userPoolConfigOverrides));
}

test("Should apply String User Pool Client configuration overrides to default User Pool Client", () => {
    expectUserPoolClientConfigOverridesToBeApplied(JSON.stringify(userPoolConfigurationWithUserPoolClientConfigOverrides));
});


test("Should apply Object User Pool Client configuration overrides to default User Pool Client", () => {
    expectUserPoolClientConfigOverridesToBeApplied(userPoolConfigurationWithUserPoolClientConfigOverrides);
});

function expectUserPoolClientConfigOverridesToBeApplied(userPoolConfiguration: Record<string, unknown> | string) {

    // Given
    const stack = new cdk.Stack();
    stack.node.setContext("userPoolConfiguration", userPoolConfiguration);

    // When
    new KaiUserPool(stack, "TestUserPool");

    // Then
    expectCDK(stack).to(haveResource("AWS::Cognito::UserPoolClient", userPoolClientConfigOverrides));
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
