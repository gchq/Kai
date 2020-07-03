/*
 * Copyright 2020 Crown Copyright
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as path from "path";
import { Construct, CustomResource } from "@aws-cdk/core";
import { GraphUninstallerProps } from "./graph-uninstaller-props";
import { Function, Runtime, AssetCode } from "@aws-cdk/aws-lambda";
import { PolicyStatement } from "@aws-cdk/aws-iam";
import { Provider } from "@aws-cdk/custom-resources";

export class GraphUninstaller extends Construct {

    constructor(scope: Construct, id: string, props: GraphUninstallerProps) {
        super(scope, id);
        this.createConstructs(id, props);
    }

    private createConstructs(id: string, props: GraphUninstallerProps) {

        const uninstallGraphsLambda = new Function(this, "UninstallGraphsLambda", {
            runtime: Runtime.PYTHON_3_7,
            code: new AssetCode(path.join(__dirname, "lambdas")),
            handler: "uninstall_graphs.handler",
            layers: [ props.kubectlLayer ],
            timeout: props.timeout,
            environment: {
                "get_graphs_function_arn": props.getGraphsFunctionArn,
                "delete_graph_function_arn": props.deleteGraphFunctionArn
            }
        });

        const lambdaInvokePolicyStatement: PolicyStatement = new PolicyStatement({
            resources: [
                props.deleteGraphFunctionArn,
                props.getGraphsFunctionArn
            ],
            actions: [
                "lambda:InvokeFunction"
            ]
        });

        if (uninstallGraphsLambda.role) {
            uninstallGraphsLambda.role.addToPolicy(lambdaInvokePolicyStatement);
        }

        const uninstallGraphsCustomResourceProvider = new Provider(this, "UninstallGraphsCustomResourceProvider", {
            onEventHandler: uninstallGraphsLambda
        });

        const uninstallGraphsCustomResource = new CustomResource(this, "UninstallGraphsCustomResource", {
            serviceToken: uninstallGraphsCustomResourceProvider.serviceToken
        });

        for (const dependency of props.dependencies) {
            uninstallGraphsCustomResource.node.addDependency(dependency);
        }
    }
}