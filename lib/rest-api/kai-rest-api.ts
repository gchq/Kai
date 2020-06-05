import * as cdk from "@aws-cdk/core";
import * as api from "@aws-cdk/aws-apigateway";
import * as lambda from "@aws-cdk/aws-lambda";
import * as sqs from "@aws-cdk/aws-sqs";
import * as path from "path";

export class KaiRestApi extends cdk.Construct {
    private readonly _addGraphQueue: sqs.Queue; 

    constructor(scope: cdk.Construct, readonly id: string) {
        super(scope, id);
        // REST API
        const restApi = new api.RestApi(this, "KaiRestApi"); // Could add a default 404 handler here
        const graphResource = restApi.root.addResource("graphs") ;


        // Add Graph Queue
        this._addGraphQueue = new sqs.Queue(this, "AddGraphQueue", { 
            visibilityTimeout: cdk.Duration.minutes(10)
        });
        
        // Add Graph request handler
        const addGraphLambda = new lambda.Function(this, "AddGraphHandler", {
            runtime: lambda.Runtime.PYTHON_3_7,
            code: new lambda.AssetCode(path.join(__dirname, "lambdas")),
            handler: "add_graph_request.handler",
            timeout: cdk.Duration.seconds(30),
            environment: {
                sqs_queue_url: this.addGraphQueue.queueUrl
            }
        });

        this.addGraphQueue.grantSendMessages(addGraphLambda);
        graphResource.addMethod("POST", new api.LambdaIntegration(addGraphLambda));
    }

    public get addGraphQueue(): sqs.Queue { 
        return this._addGraphQueue;
    }
}