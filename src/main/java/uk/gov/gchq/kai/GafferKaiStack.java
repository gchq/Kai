package uk.gov.gchq.kai;

import software.amazon.awscdk.core.Construct;
import software.amazon.awscdk.core.Stack;
import software.amazon.awscdk.core.StackProps;
import uk.gov.gchq.kai.service.GraphService;

public class GafferKaiStack extends Stack {
    public GafferKaiStack(final Construct scope, final String id) {
        this(scope, id, null);
    }

    public GafferKaiStack(final Construct scope, final String id, final StackProps props) {
        super(scope, id, props);

        new GraphService(this, "Graphs");
    }
}
