import * as cdk from "@aws-cdk/core";
import * as sam from "@aws-cdk/aws-sam";
import * as api from "@aws-cdk/aws-apigateway";
import * as iam from "@aws-cdk/aws-iam";
import * as lamdba from "@aws-cdk/aws-lambda";
import * as sqs from "@aws-cdk/aws-sqs";
import * as les from "@aws-cdk/aws-lambda-event-sources"
import * as path from 'path';
import { Runtime, AssetCode } from "@aws-cdk/aws-lambda";
import { LambdaIntegration } from "@aws-cdk/aws-apigateway";
import { KaiRestApiProps } from "./kai-rest-api-props";

export class KaiRestApi extends cdk.Construct {
    private _addGraphQueue: sqs.Queue; 

    constructor(scope: cdk.Construct, id: string) {
        super(scope, id);
        // REST API
        const restApi = new api.RestApi(this, "KaiRestApi"); // Could add a default 404 handler here
        const graphResource = restApi.root.addResource("graphs") ;


        // Add Graph Queue
        this._addGraphQueue = new sqs.Queue(this, "AddGraphQueue", { 
            visibilityTimeout: cdk.Duration.minutes(10)
        });
        
        // Add Graph request handler
        const addGraphLambda = new lamdba.Function(this, "AddGraphHandler", {
            runtime: Runtime.PYTHON_3_7,
            code: new AssetCode(path.join(__dirname, "lambdas", "endpoints")),
            handler: "add_graph_request.handler",
            timeout: cdk.Duration.seconds(30),
            environment: {
                sqs_queue_url: this.addGraphQueue.queueUrl
            }
        });

        this.addGraphQueue.grantSendMessages(addGraphLambda)
        graphResource.addMethod("POST", new LambdaIntegration(addGraphLambda))
    }

    public get addGraphQueue(): sqs.Queue { 
        return this._addGraphQueue;
    }
}