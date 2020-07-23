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
import { Stack } from "@aws-cdk/core";
import { KaiRestAuthorizer } from "../../../lib/rest-api/authentication/kai-rest-authorizer";

const testRestApiId = "testRestApiId";
const testUserPoolArn = "testUserPoolArn";

function createAuthorizer(stack: Stack, id = "TestAuthorizer"): KaiRestAuthorizer {
    return new KaiRestAuthorizer(stack, id, {
        "restApiId": testRestApiId,
        "userPoolArn": testUserPoolArn
    });
}

test("The stack contains the expected ApiGateway Authorizer", () => {
    // Given
    const stack = new Stack();

    // When
    createAuthorizer(stack);

    // Then
    expectCDK(stack).to(haveResource("AWS::ApiGateway::Authorizer", {
        RestApiId: testRestApiId,
        Type: "COGNITO_USER_POOLS",
        IdentitySource: "method.request.header.Authorization",
        Name: "KaiRestApiAuthorizer",
        ProviderARNs: [
            testUserPoolArn
        ]
    }));
});

test("The Kai Rest Authorizer generates the expected MethodOptions", () => {
    // Given
    const stack = new Stack();

    // When
    const kaiRestAuthorizer = createAuthorizer(stack);

    // Then
    expect(kaiRestAuthorizer.methodOptions).toEqual(expect.objectContaining({
        apiKeyRequired: false,
        authorizer: {
            authorizerId: expect.anything(),
            authorizationType: "COGNITO_USER_POOLS"
        }
    }));
});
