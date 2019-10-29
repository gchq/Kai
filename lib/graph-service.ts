import core = require('@aws-cdk/core');
import lambda = require('@aws-cdk/aws-lambda');
import apigateway = require('@aws-cdk/aws-apigateway');

export class GraphService extends core.Construct {
    constructor(scope: core.Construct, id: string) {
        super(scope, id);

        const lambdas = new lambda.AssetCode('lambdas');

        const getAllGraphsHandler = new lambda.Function(this, 'GetAllGraphsHandler', {
            runtime: lambda.Runtime.NODEJS_10_X,
            code: lambdas,
            handler: 'graphs.getAll'
        });

        const addGraphHandler = new lambda.Function(this, 'AddGraphHandler', {
            runtime: lambda.Runtime.NODEJS_10_X,
            code: lambdas,
            handler: 'graphs.add'
        });

        const deleteGraphHandler = new lambda.Function(this, 'DeleteGraphHandler', {
            runtime: lambda.Runtime.NODEJS_10_X,
            code: lambdas,
            handler: 'graphs.delete'
        });

        const api = new apigateway.RestApi(this, 'graph-api', {
            restApiName: 'Graph Service',
            description: 'This service allows you to control graphs'
        });

        const getAllGraphsIntegration = new apigateway.LambdaIntegration(getAllGraphsHandler, {});
        const addGraphIntegration = new apigateway.LambdaIntegration(addGraphHandler, {});
        const deleteGraphIntegration = new apigateway.LambdaIntegration(deleteGraphHandler, {});

        api.root.addMethod('GET', getAllGraphsIntegration);
        api.root.addMethod('POST', addGraphIntegration);
        const graphEndpoint = api.root.addResource("{graphUrl}");
        graphEndpoint.addMethod('DELETE', deleteGraphIntegration);
    }
}