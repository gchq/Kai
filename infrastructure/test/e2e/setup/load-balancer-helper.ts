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

import * as AWS from "aws-sdk";

export class LoadBalancerHelper {

    private readonly _clusterName: string;
    private readonly _stackName: string;
    private readonly _elbv2: AWS.ELBv2;
    private readonly _maxResourceArnsForDescribeTags: number = 20;

    constructor(clusterName: string, stackName: string) {
        this._clusterName = clusterName;
        this._stackName = stackName;
        this._elbv2 = new AWS.ELBv2({apiVersion: "2015-12-01"});
    }

    public async getApplicationLoadBalancersForGraph(graphName: string): Promise<string[]> {
        return this._elbv2.describeLoadBalancers().promise().then(
            (describeLoadBalancersOutput: AWS.ELBv2.DescribeLoadBalancersOutput) => {
                if (describeLoadBalancersOutput.LoadBalancers) {
                    return describeLoadBalancersOutput.LoadBalancers
                        .filter(lb => lb.Type == "application")
                        .map(lb => lb.LoadBalancerArn)
                        .filter((loadBalancerArn): loadBalancerArn is string => loadBalancerArn !== null);
                } else {
                    return [];
                }
            }
        ).then(
            (loadBalancerArns: string[]) => {
                return this.findResourcesRelatedToGraph(graphName, loadBalancerArns);
            }
        );
    }


    public async getTargetGroupsForGraph(graphName: string): Promise<string[]> {
        return this._elbv2.describeTargetGroups().promise().then(
            (describeTargetGroupsOutput: AWS.ELBv2.DescribeTargetGroupsOutput) => {
                if (describeTargetGroupsOutput.TargetGroups) {
                    return describeTargetGroupsOutput.TargetGroups
                        .map(lb => lb.TargetGroupArn)
                        .filter((targetGroupArn): targetGroupArn is string => targetGroupArn !== null);
                } else {
                    return [];
                }
            }
        ).then(
            (targetGroupArns: string[]) => {
                return this.findResourcesRelatedToGraph(graphName, targetGroupArns);
            }
        );
    }


    private async findResourcesRelatedToGraph(graphName: string, resourceArns: string[]): Promise<string[]> {
        let start = 0;
        let end = this._maxResourceArnsForDescribeTags;
        let relatedResources: string[] = [];
        do {
            const params = {
                "ResourceArns": resourceArns.slice(start, end)
            };
            await this._elbv2.describeTags(params).promise().then(
                (describeTagsOutput: AWS.ELBv2.DescribeTagsOutput) => {
                    if (describeTagsOutput.TagDescriptions) {
                        relatedResources = relatedResources.concat(describeTagsOutput.TagDescriptions
                            .filter((tagDescription): tagDescription is AWS.ELBv2.TagDescription => tagDescription !== null)
                            .filter(tagDescription => this.isResourceTagIsRelatedToGraph(graphName, tagDescription))
                            .map(tagDescription => tagDescription.ResourceArn)
                            .filter((arn): arn is string => arn !== null));
                    }
                }
            );

            start += this._maxResourceArnsForDescribeTags;
            end += this._maxResourceArnsForDescribeTags;

        } while (resourceArns.length >= end);

        return relatedResources;
    }


    private isResourceTagIsRelatedToGraph(graphName: string, tagDescription: AWS.ELBv2.TagDescription): boolean {
        let clusterTagFound = false;
        let ingressTagFound = false;
        if (tagDescription.Tags) {
            for (const tag of tagDescription.Tags) {
                if (tag.Key === "kubernetes.io/cluster/" + this._clusterName) {
                    if (tag.Value && tag.Value == "owned") {
                        clusterTagFound = true;
                    }
                }
                if (tag.Key === "kubernetes.io/ingress-name") {
                    if (tag.Value && this.getGraphIngressNames(graphName).includes(tag.Value)) {
                        ingressTagFound = true;
                    }
                }
            }
        }
        return clusterTagFound && ingressTagFound;
    }

    private getGraphIngressNames(graphName: string): string[] {
        const lowerCaseGraphName = graphName.toLowerCase();
        return [
            lowerCaseGraphName + "-hdfs",
            lowerCaseGraphName + "-gaffer-api",
            lowerCaseGraphName + "-gaffer-monitor"
        ];
    }
}
