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

 import * as cdk from "@aws-cdk/core";
import * as eks from "@aws-cdk/aws-eks";
import * as iam from "@aws-cdk/aws-iam";
import * as ec2 from "@aws-cdk/aws-ec2";
import { albPolicyStatement } from "./alb-policy-statement";
import { NodeGroupConfig } from "./node-group-config";

export class GraphPlatForm extends cdk.Construct {

    private static readonly DEFAULT_VPC: string = "DEFAULT"
    private readonly _eksCluster: eks.Cluster;

    constructor(scope: cdk.Construct, id: string) {
        super(scope, id);

        // Get contextual values
        const vpcId: string = this.node.tryGetContext("vpcId");
        const clusterName: string = this.node.tryGetContext("clusterName");

        // Master role
        const mastersRole = new iam.Role(this, clusterName + "MasterRole", {
            assumedBy: new iam.AccountRootPrincipal()
        });

        // VPC 
        let vpc: ec2.IVpc;
        if (vpcId != null) {
            // Use an existing vpc
            if (vpcId == GraphPlatForm.DEFAULT_VPC) {
                vpc = ec2.Vpc.fromLookup(this, "eksClusterVpc", {
                    isDefault: true
                });
            } else {
                vpc = ec2.Vpc.fromLookup(this, "eksClusterVpc", {
                    vpcId: vpcId
                });
            }
        } else {
            // Create one
            // todo allow user to specify vpc properties
            vpc = new ec2.Vpc(this, clusterName + "Vpc");
        }

        // Create cluster
        this._eksCluster = new eks.Cluster(this, clusterName + "EksCluster", {
            clusterName: clusterName,
            kubectlEnabled: true,
            vpc: vpc,
            mastersRole: mastersRole,
            defaultCapacity: 0
        });

        // Create node group
        
        let unparsedRequestedNodeGroup = this.node.tryGetContext("clusterNodegroup");
        let nodeGroup: eks.NodegroupOptions;
        if (unparsedRequestedNodeGroup != null) {
            // if it's a string (for example if passed from the command line), convert to object
            if (typeof unparsedRequestedNodeGroup == "string") {
                unparsedRequestedNodeGroup = JSON.parse(unparsedRequestedNodeGroup);
            } 

            const requestedNodeGroup = NodeGroupConfig.fromConfig(unparsedRequestedNodeGroup);
            nodeGroup = requestedNodeGroup.toNodeGroupOptions();
        } else {
            nodeGroup = NodeGroupConfig.DEFAULT_NODE_GROUP;
        }


        this.eksCluster.addNodegroup("graphNodes", nodeGroup);

        // Add Ingress Controller
        const albServiceAccount = new eks.ServiceAccount(this, "ALBIngressController", {
            cluster: this.eksCluster,
            name: "alb-ingress-controller",
            namespace: "kube-system"
        });
        
        albServiceAccount.addToPolicy(albPolicyStatement);


        this.eksCluster.addChart("ALBIngress", {
            chart: "aws-alb-ingress-controller",
            repository: "http://storage.googleapis.com/kubernetes-charts-incubator",
            release: "alb-ingress",
            namespace: "kube-system",
            values: {
                autoDiscoverAwsRegion: true,
                autoDiscoverAwsVpcID: true,
                clusterName: this.eksCluster.clusterName,
                rbac: {
                    serviceAccount: {
                        name: albServiceAccount.serviceAccountName,
                        create: false
                    }
                }
            }
        });
    }

    public get eksCluster(): eks.Cluster {
        return this._eksCluster;
    }
}