import * as cdk from "@aws-cdk/core"
import { GraphPlatForm } from "./platform/graph-platform";
import { KaiRestApi } from "./rest-api/kai-rest-api";

// The main stack for Kai
export class AppStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props: cdk.StackProps) {
        super(scope, id, props);

        const platform = new GraphPlatForm(this, "GraphPlatform");
        new KaiRestApi(this, "RestApi", { cluster: platform.eksCluster });
    }
}