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

import * as cognito from "@aws-cdk/aws-cognito";

export interface IUserPoolConfig {
    externalPool?: IExternalPool;
    defaultPoolConfig?: IDefaultPoolConfig;
}

export interface IExternalPool {
    userPoolId: string;
    userPoolClientId: string;
}

export interface IDefaultPoolConfig {
    userPoolProps?: cognito.UserPoolProps;
    userPoolClientOptions?: cognito.UserPoolClientOptions;
}

export class UserPoolConfig implements IUserPoolConfig {

    public static readonly DEFAULT: UserPoolConfig = new UserPoolConfig(undefined, {});

    private readonly _externalPool: IExternalPool | undefined;
    private readonly _defaultPoolConfig: IDefaultPoolConfig | undefined;

    constructor(
        externalPool?: IExternalPool,
        defaultPoolConfig?: IDefaultPoolConfig
    ) {
        this._externalPool = externalPool;
        this._defaultPoolConfig = defaultPoolConfig;
    }

    public get useExternalPool(): boolean {
        return this._externalPool ? true : false;
    }

    public get useDefaultPool(): boolean {
        return this._defaultPoolConfig ? true : false;
    }

    public get externalPool(): IExternalPool | undefined {
        return this._externalPool;
    }

    public get defaultPoolConfig(): IDefaultPoolConfig | undefined {
        return this._defaultPoolConfig;
    }

    public static fromConfig(config?: IUserPoolConfig): UserPoolConfig {
        if (UserPoolConfig.isValidConfig(config)) {
            return new UserPoolConfig(config.externalPool, config.defaultPoolConfig);
        } else {
            throw new Error(config + " is not a valid User Pool config");
        }
    }

    private static isValidConfig(config?: IUserPoolConfig): config is IUserPoolConfig {
        if (!config) {
            return false;
        }
        if (!config.externalPool && !config.defaultPoolConfig) {
            return false;
        }
        if (config.externalPool && config.defaultPoolConfig) {
            return false;
        }
        if (!config.externalPool) {
            return true;
        }
        if (!config.externalPool.userPoolId || !config.externalPool.userPoolClientId) {
            return false;
        }
        return true;
    }
}