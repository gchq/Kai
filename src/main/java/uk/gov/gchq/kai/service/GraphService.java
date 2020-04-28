package uk.gov.gchq.kai.service;

import org.jetbrains.annotations.NotNull;

import software.amazon.awscdk.core.Construct;
import software.amazon.awscdk.services.apigateway.LambdaIntegration;
import software.amazon.awscdk.services.apigateway.Resource;
import software.amazon.awscdk.services.apigateway.RestApi;
import software.amazon.awscdk.services.lambda.AssetCode;
import software.amazon.awscdk.services.lambda.Code;
import software.amazon.awscdk.services.lambda.Function;
import software.amazon.awscdk.services.lambda.Runtime;

public class GraphService extends Construct {
    private static final AssetCode LAMBDAS = Code.fromAsset("lambdas");

    public GraphService(@NotNull final Construct scope, @NotNull final String id) {
        super(scope, id);

        Function getAllHandler = createFunction("getAllHandler", "graphs.getAll");
        Function deleteHandler = createFunction("deleteHandler", "graphs.delete");
        Function addHandler = createFunction("addHandler", "graphs.add");

        RestApi restApi = RestApi.Builder.create(this, "Kai-API").restApiName("Graph Service")
                .description("This service lets you interact with graphs").build();

        Resource graphResource = restApi.getRoot().addResource("graphs");

        graphResource.addMethod("GET", new LambdaIntegration(getAllHandler));
        graphResource.addMethod("POST", new LambdaIntegration(addHandler));
        graphResource.addResource("{graphId}").addMethod("DELETE", new LambdaIntegration(deleteHandler));
    }

    private Function createFunction(final String name, final String handler) {
        return Function.Builder.create(this, name).runtime(Runtime.NODEJS_10_X).code(GraphService.LAMBDAS)
                .handler(handler).build();
    }

}