package uk.gov.gchq.kai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import software.amazon.awscdk.core.App;

public final class TestUtils {
    private static final ObjectMapper objectMapper = new ObjectMapper().configure(SerializationFeature.INDENT_OUTPUT, true);
    // All Tests must use the same app otherwise you get errors:
    // Consuming and producing stacks must be defined within the same CDK app.(..)
    private static App app = new App();

    public static ObjectMapper getObjectMapper() {
        return objectMapper;
    }

    public static App getApp() {
        return app;
    }

}
