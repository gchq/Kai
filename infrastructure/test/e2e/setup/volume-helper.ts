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

export class VolumeHelper {

    private readonly _clusterName: string;
    private readonly _stackName: string;
    private readonly _ec2: AWS.EC2;

    constructor(clusterName: string, stackName: string) {
        this._clusterName = clusterName;
        this._stackName = stackName;
        this._ec2 = new AWS.EC2({apiVersion: "2016-11-15"});
    }


    public async checkVolumesForGraphHaveBeenDeleted(graphName: string): Promise<boolean> {
        const params = {
            Filters: [
                {
                    Name: "tag:kubernetes.io/cluster/" + this._clusterName,
                    Values: [ "owned" ]
                },
                {
                    Name: "tag:kubernetes.io/created-for/pvc/name",
                    Values: this.getGraphPvcNames(graphName)
                }
            ]
        };
        return this._ec2.describeVolumes(params).promise().then(
            (describeVolumesResult: AWS.EC2.DescribeVolumesResult) => {
                if (describeVolumesResult.Volumes && describeVolumesResult.Volumes.length) {
                    const params = {
                        VolumeIds: describeVolumesResult.Volumes.map(this.toVolumeId)
                    };
                    return this._ec2.waitFor("volumeDeleted", params).promise().then(
                        () => {
                            return true;
                        }
                    );
                } else {
                    return true;
                }
            }
        );
    }


    private getGraphPvcNames(graphName: string): string[] {
        const lowerCaseGraphName = graphName.toLowerCase();
        return [
            "data*-" + lowerCaseGraphName + "-hdfs-datanode-*",
            "data*-" + lowerCaseGraphName + "-hdfs-namenode-*",
            "data*-" + lowerCaseGraphName + "-zookeeper-*"
        ];
    }


    private toVolumeId(volume: AWS.EC2.Volume): string {
        if (volume.VolumeId) {
            return volume.VolumeId;
        } else {
            return "not set";
        }
    }
}
