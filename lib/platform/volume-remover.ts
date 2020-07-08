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
import { VolumeRemoverProps } from "./volume-remover-props";
import { Function, Runtime, AssetCode } from "@aws-cdk/aws-lambda";
import { PolicyStatement } from "@aws-cdk/aws-iam";
import { Provider } from "@aws-cdk/custom-resources";

export class VolumeRemover extends Construct {

    constructor(scope: Construct, id: string, props: VolumeRemoverProps) {
        super(scope, id);
        this.createConstructs(id, props);
    }

    private createConstructs(id: string, props: VolumeRemoverProps) {

        const deleteVolumesLambda = new Function(this, "DeleteVolumesLambda", {
            runtime: Runtime.PYTHON_3_7,
            code: new AssetCode(path.join(__dirname, "lambdas")),
            handler: "delete_volumes.handler",
            layers: [ props.kubectlLayer ],
            timeout: props.timeout,
            environment: {
                "cluster_name": props.clusterName
            }
        });

        const volumeManagementPolicyStatement: PolicyStatement = new PolicyStatement({
            resources: ["*"],
            actions: [
                "ec2:DescribeVolumes",
                "ec2:DeleteVolume"
            ]
        });

        if (deleteVolumesLambda.role) {
            deleteVolumesLambda.role.addToPolicy(volumeManagementPolicyStatement);
        }

        const deleteVolumesCustomResourceProvider = new Provider(this, "DeleteVolumesCustomResourceProvider", {
            onEventHandler: deleteVolumesLambda
        });

        new CustomResource(this, "DeleteVolumesCustomResource", {
            serviceToken: deleteVolumesCustomResourceProvider.serviceToken
        });
    }
}