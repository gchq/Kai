package uk.gov.gchq.kai;

import com.fasterxml.jackson.databind.JsonNode;
import org.junit.Test;
import software.amazon.awscdk.core.App;

import java.io.IOException;

import static org.junit.Assert.assertEquals;
import static uk.gov.gchq.kai.TestUtils.getApp;
import static uk.gov.gchq.kai.TestUtils.getObjectMapper;

/**
 * Tests that the overall template remains the same. Note that if changes are made to the app
 * and the stack-template.json file is not updated, then this test will fail.
 *
 * To update the stack template, run:
 * cdk synth --json --path-metadata=false --asset-metadata=false --version-reporting=false > src/test/resources/stack-template.json
 */
public class KaiStackTest {

    @Test
    public void stackShouldMatchTemplate() throws IOException {
        App app = getApp();
        GafferKaiStack stack = new GafferKaiStack(app, "GafferKaiStack"); // must be the same as in app

        JsonNode actual =
        getObjectMapper().valueToTree(app.synth().getStackArtifact(stack.getArtifactId()).getTemplate());
        JsonNode expected = getObjectMapper().readTree(getClass().getResourceAsStream("/stack-template.json"));

        // If Not equal, print to screen for easier comparison
        if (!expected.equals(actual)) {
            System.err.println(actual.toPrettyString());
        }

        assertEquals(expected, actual);
    }
}
