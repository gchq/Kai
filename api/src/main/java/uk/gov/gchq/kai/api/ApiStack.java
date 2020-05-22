package uk.gov.gchq.kai.api;

import software.amazon.awscdk.core.Construct;
import software.amazon.awscdk.core.Stack;
import software.amazon.awscdk.core.StackProps;
import uk.gov.gchq.kai.api.service.GraphService;

public class ApiStack extends Stack {
    public ApiStack(final Construct scope, final String id) {
        this(scope, id, null);
    }

    public ApiStack(final Construct scope, final String id, final StackProps props) {
        super(scope, id, props);

        new GraphService(this, "Graphs");
    }
}
