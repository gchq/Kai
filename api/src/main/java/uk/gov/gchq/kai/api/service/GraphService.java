package uk.gov.gchq.kai.api.service;

import org.jetbrains.annotations.NotNull;
import software.amazon.awscdk.core.Construct;
import software.amazon.awscdk.services.apigateway.LambdaIntegration;
import software.amazon.awscdk.services.apigateway.Resource;
import software.amazon.awscdk.services.apigateway.RestApi;
import software.amazon.awscdk.services.lambda.Code;
import software.amazon.awscdk.services.lambda.Function;
import software.amazon.awscdk.services.lambda.Runtime;

import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.stream.Collectors;

public class GraphService extends Construct {

    public GraphService(@NotNull final Construct scope, @NotNull final String id) {
        super(scope, id);


        Function getAllHandler = createFunction("getAllHandler", "index.getAll", "get_all_graphs.js");
        Function deleteHandler = createFunction("deleteHandler", "index.delete", "delete_graph.js");
        Function addHandler = createFunction("addHandler", "index.add", "add_graph.js");

        RestApi restApi = RestApi.Builder.create(this, "Kai-API").restApiName("Graph Service")
                .description("This service lets you interact with graphs").build();

        Resource graphResource = restApi.getRoot().addResource("graphs");

        graphResource.addMethod("GET", new LambdaIntegration(getAllHandler));
        graphResource.addMethod("POST", new LambdaIntegration(addHandler));
        graphResource.addResource("{graphId}").addMethod("DELETE", new LambdaIntegration(deleteHandler));
    }

    private Code getCodeFromResources(final String path) throws FileNotFoundException {
        String code;
        InputStream codeStream = getClass().getClassLoader().getResourceAsStream(path);
        if (codeStream == null) {
            throw new FileNotFoundException("Failed to find " + path);
        }
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(codeStream))) {
            code = reader.lines().collect(Collectors.joining("\n"));
        } catch (IOException e) {
            throw new RuntimeException("Failed to create Code from " + path);
        }

        return Code.fromInline(code);
    }

    private Function createFunction(final String name, final String handler, final String path) {
        try {
            return Function.Builder.create(this, name).runtime(Runtime.NODEJS_10_X).code(getCodeFromResources(path))
                    .handler(handler).build();
        } catch (FileNotFoundException e) {
            throw new RuntimeException(e);
        }
    }

}