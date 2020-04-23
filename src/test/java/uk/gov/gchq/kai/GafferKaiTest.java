package uk.gov.gchq.kai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import org.junit.Test;
import software.amazon.awscdk.core.App;

import java.io.IOException;

import static org.junit.Assert.assertEquals;

/**
 * Tests that the overall template remains the same. Note that if changes are made to the app
 * and the stack-template.json file is not updated, then this test will fail.
 *
 * To update the stack template, run:
 * cdk synth --json --path-metadata=false --asset-metadata=false --version-reporting=false > src/test/resources/stack-template.json
 */
public class GafferKaiTest {
    private final static ObjectMapper JSON = new ObjectMapper().configure(SerializationFeature.INDENT_OUTPUT, true);

    @Test
    public void stackShouldHaveGraphService() throws IOException {
        App app = new App();
        GafferKaiStack stack = new GafferKaiStack(app, "GafferKaiStack"); // must be the same as in app

        JsonNode actual =
        JSON.valueToTree(app.synth().getStackArtifact(stack.getArtifactId()).getTemplate());
        JsonNode expected = JSON.readTree(getClass().getResourceAsStream("/stack-template.json"));

        // If Not equal, print to screen for easier comparison
        if (!expected.equals(actual)) {
            System.err.println(actual.toPrettyString());
        }

        assertEquals(expected, actual);
    }
}
