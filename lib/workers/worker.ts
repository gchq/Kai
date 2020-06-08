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

 import { Construct, Duration } from "@aws-cdk/core";
import { WorkerProps } from "./worker-props";
import * as lambda from "@aws-cdk/aws-lambda";
import * as path from "path";
import { PolicyStatement } from "@aws-cdk/aws-iam";
import { SqsEventSource } from "@aws-cdk/aws-lambda-event-sources";

export abstract class Worker extends Construct {

    constructor(scope: Construct, id: string, props: WorkerProps) {
        super(scope, id);
        this.createConstructs(props);
    }

    private createConstructs(props: WorkerProps) {
        const extraSecurityGroups = this.node.tryGetContext("extraIngressSecurityGroups");

        // Create worker from Lambda
        const addGraphWorker = new lambda.Function(this, this.workerId, {
            runtime: lambda.Runtime.PYTHON_3_7,
            code: new lambda.AssetCode(path.join(__dirname, "lambdas")),
            handler: this.handler,
            layers: [ props.kubectlLayer ],
            timeout: Duration.minutes(10),
            environment: {
                cluster_name: props.cluster.clusterName,
                extra_security_groups: extraSecurityGroups == "" ? null : extraSecurityGroups
            }
        });

        addGraphWorker.addEventSource(new SqsEventSource(props.queue));

        // Add permisssions to role
        addGraphWorker.addToRolePolicy(new PolicyStatement({
            actions: [ "eks:DescribeCluster" ],
            resources: [ props.cluster.clusterArn ]
        }));
    
        const workerRole = addGraphWorker.role;

        if (workerRole == undefined) {
            throw new Error("Worker must have an associated IAM Role");
        } else {
            props.cluster.awsAuth.addMastersRole(workerRole);
        }

    }

    abstract get workerId(): string;
    abstract get handler(): string;
}