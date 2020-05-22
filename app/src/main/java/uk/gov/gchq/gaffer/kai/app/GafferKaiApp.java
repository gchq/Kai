package uk.gov.gchq.gaffer.kai.app;

import software.amazon.awscdk.core.App;
import software.amazon.awscdk.core.Environment;
import software.amazon.awscdk.core.StackProps;
import uk.gov.gchq.kai.platform.GraphPlatformStack;

public class GafferKaiApp {

    static Environment createEnvironment(final String account, final String region) {
        return Environment.builder()
                .account((account == null) ? System.getenv("CDK_DEFAULT_ACCOUNT") : account)
                .region((region == null) ? System.getenv("CDK_DEFAULT_REGION") : region)
                .build();
    }
    public static void main(final String[] args) {
        App app = new App();

        Environment dev = createEnvironment(null, null);

//        ApiStack restApi = new ApiStack(app, "ApiStack", StackProps.builder()
//                .env(dev)
//                .build());

        GraphPlatformStack eksClusterStack = new GraphPlatformStack(app, "PlatformStack", StackProps.builder()
                .env(dev)
                .build());

        app.synth();
    }
}
