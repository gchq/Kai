package uk.gov.gchq.kai.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

public final class TestUtils {
    private static final ObjectMapper objectMapper = new ObjectMapper().configure(SerializationFeature.INDENT_OUTPUT, true);
    public static ObjectMapper getObjectMapper() {
        return objectMapper;
    }
}
