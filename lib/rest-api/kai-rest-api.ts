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
import * as api from "@aws-cdk/aws-apigateway";
import * as lambda from "@aws-cdk/aws-lambda";
import * as sqs from "@aws-cdk/aws-sqs";
import * as path from "path";
import { KaiRestApiProps } from "./kai-rest-api-props";

export class KaiRestApi extends cdk.Construct {
    private readonly _addGraphQueue: sqs.Queue;

    constructor(scope: cdk.Construct, readonly id: string, props: KaiRestApiProps) {
        super(scope, id);
        // REST API
        const restApi = new api.RestApi(this, "KaiRestApi"); // Could add a default 404 handler here
        const graphResource = restApi.root.addResource("graphs");


        // Add Graph Queue
        this._addGraphQueue = new sqs.Queue(this, "AddGraphQueue", { 
            visibilityTimeout: cdk.Duration.minutes(10)
        });

        /**
         * Ideas for next week.
         * 
         * Instead of continually adding Queues to be exposed by this object, Encapsulate the three
         * Constructs into one:
         * 
         * 1. The Service Lambda which recieves http request and quickly responds
         * 2. An sqs queue which delivers messages to the worker from the service lambda
         * 3. A Worker which manages deployments onto Kubernetes.
         * 
         * Think of it like a Job in Gaffer - an Asynchronous Request
         * It can probably live in the RestAPI section
         * 
         * We're going to need lots of these in the future for things like:
         * Creating and tearing down graphs
         * Updating schemas
         * (future possible) configuring ingest 
         * 
         */

        // Lambda asset
        const lambdas = new lambda.AssetCode(path.join(__dirname, "lambdas"));

        // Standard timeout
        const lambdaTimeout = cdk.Duration.seconds(30)
        
        // Add Graph request handler
        const addGraphLambda = new lambda.Function(this, "AddGraphHandler", {
            runtime: lambda.Runtime.PYTHON_3_7,
            code: lambdas,
            handler: "add_graph_request.handler",
            timeout: lambdaTimeout,
            environment: {
                sqs_queue_url: this.addGraphQueue.queueUrl,
                graph_table_name: props.graphTableName
            }
        });

        this.addGraphQueue.grantSendMessages(addGraphLambda);
        graphResource.addMethod("POST", new api.LambdaIntegration(addGraphLambda));

    }

    public get addGraphQueue(): sqs.Queue { 
        return this._addGraphQueue;
    }
}