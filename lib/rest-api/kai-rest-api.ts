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
import { PolicyStatement } from "@aws-cdk/aws-iam";
import { KaiRestApiProps } from "./kai-rest-api-props";
import { DELETE_GRAPH_TIMEOUT, ADD_GRAPH_TIMEOUT } from "../constants";
import { KaiRestAuthorizer } from "./authentication/kai-rest-authorizer";

export class KaiRestApi extends cdk.Construct {
    private readonly _addGraphQueue: sqs.Queue;
    private readonly _deleteGraphQueue: sqs.Queue;
    private readonly _getGraphsLambda: lambda.Function;
    private readonly _deleteGraphLambda: lambda.Function;

    constructor(scope: cdk.Construct, readonly id: string, props: KaiRestApiProps) {
        super(scope, id);
        // REST API
        const restApi = new api.RestApi(this, this.node.uniqueId + "RestApi"); // Could add a default 404 handler here
        const graphsResource = restApi.root.addResource("graphs");
        const graph = graphsResource.addResource("{graphName}");

        // Create MethodOptions to secure access to the RestApi methods using the Cognito user pool
        const methodOptions = new KaiRestAuthorizer(this, "KaiRestApiAuthorizer", {
            restApiId: restApi.restApiId,
            userPoolArn: props.userPoolArn
        }).methodOptions;

        // Service Functions all share the same code and timeout 
        const lambdas = new lambda.AssetCode(path.join(__dirname, "lambdas"));
        const lambdaTimeout = cdk.Duration.seconds(30);

        // POST handlers
        this._addGraphQueue = new sqs.Queue(this, "AddGraphQueue", { 
            visibilityTimeout: ADD_GRAPH_TIMEOUT
        });

        const addGraphLambda = new lambda.Function(this, "AddGraphHandler", {
            runtime: lambda.Runtime.PYTHON_3_7,
            code: lambdas,
            handler: "add_graph_request.handler",
            timeout: lambdaTimeout,
            environment: {
                sqs_queue_url: this.addGraphQueue.queueUrl,
                graph_table_name: props.graphTable.tableName,
                user_pool_id: props.userPoolId
            }
        });

        addGraphLambda.addToRolePolicy(new PolicyStatement({
            actions: [ "cognito-idp:ListUsers" ],
            resources: [ props.userPoolArn ]
        }));

        props.graphTable.grantReadWriteData(addGraphLambda);
        this.addGraphQueue.grantSendMessages(addGraphLambda);
        graphsResource.addMethod("POST", new api.LambdaIntegration(addGraphLambda), methodOptions);

        // DELETE handlers
        this._deleteGraphQueue = new sqs.Queue(this, "DeleteGraphQueue", { 
            visibilityTimeout: DELETE_GRAPH_TIMEOUT
        });

        this._deleteGraphLambda = new lambda.Function(this, "DeleteGraphHandler", {
            runtime: lambda.Runtime.PYTHON_3_7,
            code: lambdas,
            handler: "delete_graph_request.handler",
            timeout: lambdaTimeout,
            environment: {
                sqs_queue_url: this.deleteGraphQueue.queueUrl,
                graph_table_name: props.graphTable.tableName,
                user_pool_id: props.userPoolId
            }
        });

        props.graphTable.grantReadWriteData(this._deleteGraphLambda);
        this.deleteGraphQueue.grantSendMessages(this._deleteGraphLambda);
        graph.addMethod("DELETE", new api.LambdaIntegration(this._deleteGraphLambda), methodOptions);

        // GET handlers
        this._getGraphsLambda = new lambda.Function(this, "GetGraphsHandler", {
            runtime: lambda.Runtime.PYTHON_3_7,
            code: lambdas,
            handler: "get_graph_request.handler",
            timeout: lambdaTimeout,
            environment: {
                graph_table_name: props.graphTable.tableName,
                user_pool_id: props.userPoolId
            }
        });

        props.graphTable.grantReadData(this._getGraphsLambda);
        // Both GET and GET all are served by the same lambda
        const getGraphIntegration = new api.LambdaIntegration(this._getGraphsLambda);
        graphsResource.addMethod("GET", getGraphIntegration, methodOptions);
        graph.addMethod("GET", getGraphIntegration, methodOptions);
    }

    public get addGraphQueue(): sqs.Queue { 
        return this._addGraphQueue;
    }

    public get deleteGraphQueue(): sqs.Queue {
        return this._deleteGraphQueue;
    }

    public get getGraphsLambda(): lambda.Function {
        return this._getGraphsLambda;
    }

    public get deleteGraphLambda(): lambda.Function {
        return this._deleteGraphLambda;
    }
}
