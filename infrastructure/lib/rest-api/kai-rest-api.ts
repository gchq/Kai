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
    private readonly _lambdas: lambda.AssetCode;
    private readonly _lambdaTimeout: cdk.Duration;
    private readonly _methodOptions: api.MethodOptions;
    private readonly _restApi: api.RestApi;
    private readonly _props: KaiRestApiProps;
    private readonly _listCognitoUserPoolPolicyStatement: PolicyStatement;

    private _addGraphQueue: sqs.Queue;
    private _deleteGraphQueue: sqs.Queue;
    private _getGraphsLambda: lambda.Function;
    private _deleteGraphLambda: lambda.Function;

    constructor(scope: cdk.Construct, readonly id: string, props: KaiRestApiProps) {
        super(scope, id);

        this._props = props;

        // REST API
        this._restApi = new api.RestApi(this, this.node.uniqueId + "RestApi"); // Could add a default 404 handler here

        // Create MethodOptions to secure access to the RestApi methods using the Cognito user pool
        this._methodOptions = new KaiRestAuthorizer(this, "KaiRestApiAuthorizer", {
            restApiId: this._restApi.restApiId,
            userPoolArn: this._props.userPoolArn
        }).methodOptions;

        // Create Policy Statement enabling user pool listing
        this._listCognitoUserPoolPolicyStatement = new PolicyStatement({
            actions: [ "cognito-idp:ListUsers" ],
            resources: [ this._props.userPoolArn ]
        });

        // Service Functions all share the same code and timeout
        this._lambdas = new lambda.AssetCode(path.join(__dirname, "lambdas"));
        this._lambdaTimeout = cdk.Duration.seconds(30);

        // Create the API Resources
        this.createGraphsResource();
        this.createNamespacesResource();
    }

    private createGraphsResource(): void {
        const graphsResource = this._restApi.root.addResource("graphs");
        const graph = graphsResource.addResource("{graphName}");

        // POST handlers
        this._addGraphQueue = new sqs.Queue(this, "AddGraphQueue", {
            visibilityTimeout: ADD_GRAPH_TIMEOUT
        });

        const addGraphLambdaEnvironment = {
            sqs_queue_url: this.addGraphQueue.queueUrl,
            graph_table_name: this._props.graphTable.tableName,
            user_pool_id: this._props.userPoolId
        };

        const addGraphLambda = this.createLambda("AddGraphHandler", "add_graph_request.handler", addGraphLambdaEnvironment);

        addGraphLambda.addToRolePolicy(this._listCognitoUserPoolPolicyStatement);

        this._props.graphTable.grantReadWriteData(addGraphLambda);
        this.addGraphQueue.grantSendMessages(addGraphLambda);
        graphsResource.addMethod("POST", new api.LambdaIntegration(addGraphLambda), this._methodOptions);

        // DELETE handlers
        this._deleteGraphQueue = new sqs.Queue(this, "DeleteGraphQueue", {
            visibilityTimeout: DELETE_GRAPH_TIMEOUT
        });

        const deleteGraphLambdaEnvironment = {
            sqs_queue_url: this.deleteGraphQueue.queueUrl,
            graph_table_name: this._props.graphTable.tableName,
            user_pool_id: this._props.userPoolId
        };

        this._deleteGraphLambda = this.createLambda("DeleteGraphHandler", "delete_graph_request.handler", deleteGraphLambdaEnvironment);

        this._props.graphTable.grantReadWriteData(this._deleteGraphLambda);
        this.deleteGraphQueue.grantSendMessages(this._deleteGraphLambda);
        graph.addMethod("DELETE", new api.LambdaIntegration(this._deleteGraphLambda), this._methodOptions);

        const getGraphLambdaEnvironment = {
            graph_table_name: this._props.graphTable.tableName,
            user_pool_id: this._props.userPoolId
        };

        // GET handlers
        this._getGraphsLambda = this.createLambda("GetGraphsHandler", "get_graph_request.handler", getGraphLambdaEnvironment);

        this._props.graphTable.grantReadData(this._getGraphsLambda);
        // Both GET and GET all are served by the same lambda
        const getGraphIntegration = new api.LambdaIntegration(this._getGraphsLambda);
        graphsResource.addMethod("GET", getGraphIntegration, this._methodOptions);
        graph.addMethod("GET", getGraphIntegration, this._methodOptions);
    }


    private createNamespacesResource(): void {
        const namespacesResource = this._restApi.root.addResource("namespaces");
        const namespace = namespacesResource.addResource("{namespaceName}");

        const namespaceLambdaEnvironment = {
            cluster_name: this._props.clusterName,
            namespace_table_name: this._props.namespaceTable.tableName,
            user_pool_id: this._props.userPoolId
        };

        // Add
        const addNamespaceLambda = this.createLambda("AddNamespaceHandler", "add_namespace_request.handler", namespaceLambdaEnvironment);
        addNamespaceLambda.addToRolePolicy(this._listCognitoUserPoolPolicyStatement);
        this._props.namespaceTable.grantReadWriteData(addNamespaceLambda);
        namespacesResource.addMethod("POST", new api.LambdaIntegration(addNamespaceLambda), this._methodOptions);

        // Get
        const getNamespacesLambda = this.createLambda("GetNamespacesHandler", "get_namespace_request.handler", namespaceLambdaEnvironment);
        this._props.namespaceTable.grantReadData(getNamespacesLambda);
        const getNamespaceIntegration = new api.LambdaIntegration(getNamespacesLambda);
        namespacesResource.addMethod("GET", getNamespaceIntegration, this._methodOptions);
        namespace.addMethod("GET", getNamespaceIntegration, this._methodOptions);

        // Update
        const updateNamespaceLambda = this.createLambda("UpdateNamespaceHandler", "update_namespace_request.handler", namespaceLambdaEnvironment);
        updateNamespaceLambda.addToRolePolicy(this._listCognitoUserPoolPolicyStatement);
        this._props.namespaceTable.grantReadWriteData(updateNamespaceLambda);
        namespace.addMethod("POST", new api.LambdaIntegration(updateNamespaceLambda), this._methodOptions);

        // Delete
        const deleteNamespaceLambda = this.createLambda("DeleteNamespaceHandler", "delete_namespace_request.handler", namespaceLambdaEnvironment);
        this._props.namespaceTable.grantReadWriteData(deleteNamespaceLambda);
        namespace.addMethod("DELETE", new api.LambdaIntegration(deleteNamespaceLambda), this._methodOptions);
    }

    private createLambda(id: string, handler: string, environment: {[key: string]: string}): lambda.Function {
        return new lambda.Function(this, id, {
            runtime: lambda.Runtime.PYTHON_3_7,
            code: this._lambdas,
            handler: handler,
            timeout: this._lambdaTimeout,
            environment: environment
        });
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
