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

/**
 * @group unit
 */

import { IExternalPool, IDefaultPoolConfig, IUserPoolConfig, UserPoolConfig } from "../../lib/authentication/user-pool-config";

const ERROR_MESSAGE_REGEXP = /is not a valid User Pool config/;

const VALID_EXTERNAL_POOL: IExternalPool = {
    "userPoolId": "x",
    "userPoolClientId": "y"
};

const VALID_DEFAULT_CONFIG: IDefaultPoolConfig = {
    "userPoolProps": {},
    "userPoolClientOptions": {}
};

const VALID_EXTERNAL_POOL_CONFIG: IUserPoolConfig = {
    "externalPool": VALID_EXTERNAL_POOL
};

const VALID_DEFAULT_POOL_CONFIG: IUserPoolConfig = {
    "defaultPoolConfig": VALID_DEFAULT_CONFIG
};

test("Should throw Error when supplying undefined config", () => {
    expect(() => UserPoolConfig.fromConfig()).toThrowError(ERROR_MESSAGE_REGEXP);
});

test("Should throw Error when supplying empty config", () => {
    expect(() => UserPoolConfig.fromConfig({})).toThrowError(ERROR_MESSAGE_REGEXP);
});

test("Should throw Error when supplying both external and default config.", () => {
    expect(() => {
        UserPoolConfig.fromConfig({
            "externalPool": {
                "userPoolId": "x",
                "userPoolClientId": "y"
            },
            "defaultPoolConfig": {}
        });
    }).toThrowError(ERROR_MESSAGE_REGEXP);
});

test("Should configure external user pool when supplying valid external config", () => {
    const pool: UserPoolConfig = UserPoolConfig.fromConfig(VALID_EXTERNAL_POOL_CONFIG);
    expect(pool.useExternalPool).toBe(true);
    expect(pool.useDefaultPool).toBe(false);
    expect(pool.externalPool).toStrictEqual(VALID_EXTERNAL_POOL);
    expect(pool.defaultPoolConfig).toBeUndefined();
});

test("Should configure default user pool when supplying valid default config", () => {
    const pool: UserPoolConfig = UserPoolConfig.fromConfig(VALID_DEFAULT_POOL_CONFIG);
    expect(pool.useExternalPool).toBe(false);
    expect(pool.useDefaultPool).toBe(true);
    expect(pool.externalPool).toBeUndefined();
    expect(pool.defaultPoolConfig).toStrictEqual(VALID_DEFAULT_CONFIG);
});
