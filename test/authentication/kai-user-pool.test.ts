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
import * as userPool from "../../lib/authentication/kai-user-pool";

test("Kai User Pool is created", () => {
    // Given
    const stack = new cdk.Stack();

    // When
    new userPool.KaiUserPool(stack, "TestUserPool");

    // Then
    expectCDK(stack).to(haveResource("AWS::Cognito::UserPool"));
});
