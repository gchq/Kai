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
import { ADD_GRAPH_TIMEOUT, ADD_NAMESPACE_TIMEOUT, DELETE_GRAPH_TIMEOUT, DELETE_NAMESPACE_TIMEOUT } from "../constants";
import { KaiRestAuthorizer } from "./authentication/kai-rest-authorizer";

export class KaiRestApi extends cdk.Construct {
    private readonly _lambdas: lambda.AssetCode;
    private readonly _lambdaTimeout: cdk.Duration;
    private readonly _methodOptions: api.MethodOptions;
    private readonly _restApi: api.RestApi;
    private readonly _props: KaiRestApiProps;
    private readonly _listCognitoUserPoolPolicyStatement: PolicyStatement;
    private readonly _getGraphsLambda: lambda.Function;
    private readonly _deleteGraphLambda: lambda.Function;
    private readonly _addGraphQueue: sqs.Queue = this.createQueue("AddGraphQueue", ADD_GRAPH_TIMEOUT);
    private readonly _deleteGraphQueue: sqs.Queue = this.createQueue("DeleteGraphQueue", DELETE_GRAPH_TIMEOUT);
    private readonly _addNamespaceQueue: sqs.Queue = this.createQueue("AddNamespaceQueue", ADD_NAMESPACE_TIMEOUT);
    private readonly _deleteNamespaceQueue: sqs.Queue = this.createQueue("DeleteNamespaceQueue", DELETE_NAMESPACE_TIMEOUT);

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
        const graphsResource = this._restApi.root.addResource("graphs");
        const namespacesResource = this._restApi.root.addResource("namespaces");
        const namespaceResource = namespacesResource.addResource("{namespaceName}");
        const namespaceGraphsResource = namespaceResource.addResource("graphs");
        const namespaceGraphResource = namespaceGraphsResource.addResource("{graphName}");

        // Graphs
        const graphLambdaEnvironment = {
            graph_table_name: this._props.graphTable.tableName,
            user_pool_id: this._props.userPoolId
        };

        const addGraphLambda = this.createAddGraphLambda(graphLambdaEnvironment);
        this._getGraphsLambda = this.createGetGraphLambda(graphLambdaEnvironment);
        this._deleteGraphLambda = this.createDeleteGraphLambda(graphLambdaEnvironment);

        const addGraphIntegration = new api.LambdaIntegration(addGraphLambda);
        const deleteGraphIntegration = new api.LambdaIntegration(this._deleteGraphLambda);
        const getGraphIntegration = new api.LambdaIntegration(this._getGraphsLambda);

        graphsResource.addMethod("GET", getGraphIntegration, this._methodOptions);
        namespaceGraphsResource.addMethod("GET", getGraphIntegration, this._methodOptions);
        namespaceGraphResource.addMethod("GET", getGraphIntegration, this._methodOptions);
        graphsResource.addMethod("POST", addGraphIntegration, this._methodOptions);
        namespaceGraphResource.addMethod("DELETE", deleteGraphIntegration, this._methodOptions);

        // Namespaces
        const namespaceLambdaEnvironment = {
            namespace_table_name: this._props.namespaceTable.tableName,
            user_pool_id: this._props.userPoolId
        };

        const addNamespaceLambda = this.createAddNamespaceLambda(namespaceLambdaEnvironment);
        const getNamespaceLambda = this.createGetNamespaceLambda(namespaceLambdaEnvironment);
        const updateNamespaceLambda = this.createUpdateNamespaceLambda(namespaceLambdaEnvironment);
        const deleteNamespaceLambda = this.createDeleteNamespaceLambda(namespaceLambdaEnvironment);

        const addNamespaceIntegration = new api.LambdaIntegration(addNamespaceLambda);
        const deleteNamespaceIntegration = new api.LambdaIntegration(deleteNamespaceLambda);
        const getNamespaceIntegration = new api.LambdaIntegration(getNamespaceLambda);
        const updateNamespaceIntegration = new api.LambdaIntegration(updateNamespaceLambda);

        namespacesResource.addMethod("POST", addNamespaceIntegration, this._methodOptions);
        namespacesResource.addMethod("GET", getNamespaceIntegration, this._methodOptions);
        namespaceResource.addMethod("GET", getNamespaceIntegration, this._methodOptions);
        namespaceResource.addMethod("POST", updateNamespaceIntegration, this._methodOptions);
        namespaceResource.addMethod("DELETE", deleteNamespaceIntegration, this._methodOptions);
    }

    private createQueue(id: string, visibilityTimeout: cdk.Duration): sqs.Queue {
        return new sqs.Queue(this, id, {visibilityTimeout: visibilityTimeout});
    }

    private createAddNamespaceLambda(environment: {[key: string]: string}): lambda.Function {
        const addNamespaceLambdaEnvironment: {[key: string]: string} = Object.assign({}, environment);
        addNamespaceLambdaEnvironment["sqs_queue_url"] = this.addNamespaceQueue.queueUrl;

        const addNamespaceLambda = this.createLambda("AddNamespaceHandler", "add_namespace_request.handler", addNamespaceLambdaEnvironment);
        addNamespaceLambda.addToRolePolicy(this._listCognitoUserPoolPolicyStatement);
        this._props.namespaceTable.grantReadWriteData(addNamespaceLambda);
        this.addNamespaceQueue.grantSendMessages(addNamespaceLambda);
        return addNamespaceLambda;
    }

    private createGetNamespaceLambda(environment: {[key: string]: string}): lambda.Function {
        const getNamespacesLambda = this.createLambda("GetNamespacesHandler", "get_namespace_request.handler", environment);
        this._props.namespaceTable.grantReadData(getNamespacesLambda);
        return getNamespacesLambda;
    }

    private createUpdateNamespaceLambda(environment: {[key: string]: string}): lambda.Function {
        const updateNamespaceLambda = this.createLambda("UpdateNamespaceHandler", "update_namespace_request.handler", environment);
        updateNamespaceLambda.addToRolePolicy(this._listCognitoUserPoolPolicyStatement);
        this._props.namespaceTable.grantReadWriteData(updateNamespaceLambda);
        return updateNamespaceLambda;
    }

    private createDeleteNamespaceLambda(environment: {[key: string]: string}): lambda.Function {
        const deleteNamespaceLambdaEnvironment: {[key: string]: string} = Object.assign({}, environment);
        deleteNamespaceLambdaEnvironment["sqs_queue_url"] = this.deleteNamespaceQueue.queueUrl;
        deleteNamespaceLambdaEnvironment["graph_table_name"] = this._props.graphTable.tableName;
        const deleteNamespaceLambda = this.createLambda("DeleteNamespaceHandler", "delete_namespace_request.handler", deleteNamespaceLambdaEnvironment);
        this._props.namespaceTable.grantReadWriteData(deleteNamespaceLambda);
        this._props.graphTable.grantReadData(deleteNamespaceLambda);
        this.deleteNamespaceQueue.grantSendMessages(deleteNamespaceLambda);
        return deleteNamespaceLambda;
    }

    private createAddGraphLambda(environment: {[key: string]: string}): lambda.Function {
        const addGraphLambdaEnvironment: {[key: string]: string} = Object.assign({}, environment);
        addGraphLambdaEnvironment["sqs_queue_url"] = this.addGraphQueue.queueUrl;
        addGraphLambdaEnvironment["namespace_table_name"] = this._props.namespaceTable.tableName;

        const addGraphLambda = this.createLambda("AddGraphHandler", "add_graph_request.handler", addGraphLambdaEnvironment);
        addGraphLambda.addToRolePolicy(this._listCognitoUserPoolPolicyStatement);
        this._props.graphTable.grantReadWriteData(addGraphLambda);
        this._props.namespaceTable.grantReadData(addGraphLambda);
        this.addGraphQueue.grantSendMessages(addGraphLambda);
        return addGraphLambda;
    }

    private createGetGraphLambda(environment: {[key: string]: string}): lambda.Function {
        const getGraphsLambda = this.createLambda("GetGraphsHandler", "get_graph_request.handler", environment);
        this._props.graphTable.grantReadData(getGraphsLambda);
        return getGraphsLambda;
    }

    private createDeleteGraphLambda(environment: {[key: string]: string}): lambda.Function {
        const deleteGraphLambdaEnvironment: {[key: string]: string} = Object.assign({}, environment);
        deleteGraphLambdaEnvironment["sqs_queue_url"] = this.deleteGraphQueue.queueUrl;

        const deleteGraphLambda = this.createLambda("DeleteGraphHandler", "delete_graph_request.handler", deleteGraphLambdaEnvironment);
        this._props.graphTable.grantReadWriteData(deleteGraphLambda);
        this.deleteGraphQueue.grantSendMessages(deleteGraphLambda);
        return deleteGraphLambda;
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

    public get addNamespaceQueue(): sqs.Queue {
        return this._addNamespaceQueue;
    }

    public get deleteNamespaceQueue(): sqs.Queue {
        return this._deleteNamespaceQueue;
    }
}
