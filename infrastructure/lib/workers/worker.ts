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
import { WorkerProps } from "./worker-props";
import * as lambda from "@aws-cdk/aws-lambda";
import * as path from "path";
import { SqsEventSource } from "@aws-cdk/aws-lambda-event-sources";

export class Worker extends Construct {

    private _function: lambda.Function

    constructor(scope: Construct, id: string, props: WorkerProps) {
        super(scope, id);
        this.createConstructs(id, props);
    }

    private createConstructs(id: string, props: WorkerProps) {
        const extraSecurityGroups = this.node.tryGetContext("extraIngressSecurityGroups");

        // Build environment for Lambda
        const environment: { [id: string] : string; } = {
            "cluster_name": props.cluster.clusterName,
            "table_name": props.table.tableName
        };
        if (extraSecurityGroups) {
            environment["extra_security_groups"] = extraSecurityGroups;
        }

        // Create worker from Lambda
        this._function = new lambda.Function(this, id + "Lambda", {
            runtime: lambda.Runtime.PYTHON_3_7,
            code: new lambda.AssetCode(path.join(__dirname, "lambdas")),
            handler: props.handler,
            layers: [ props.kubectlLayer ],
            timeout: props.timeout,
            environment: environment
        });

        this._function.addEventSource(new SqsEventSource(props.queue, {
            batchSize: props.batchSize
        }));

        // Add policy statements to role
        for (const policyStatement of props.policyStatements) {
            this._function.addToRolePolicy(policyStatement);
        }

        props.table.grantReadWriteData(this._function);
    
        const workerRole = this._function.role;

        if (workerRole == undefined) {
            throw new Error("Worker must have an associated IAM Role");
        } else {
            props.cluster.awsAuth.addMastersRole(workerRole);
        }
    }

    public get functionArn(): string {
        return this._function.functionArn;
    }
}