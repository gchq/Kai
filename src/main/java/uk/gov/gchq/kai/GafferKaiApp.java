package uk.gov.gchq.kai;

import software.amazon.awscdk.core.App;

public class GafferKaiApp {
    public static void main(final String[] args) {
        App app = new App();

        new GafferKaiStack(app, "GafferKaiStack");

        app.synth();
    }
}
