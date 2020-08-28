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
import { PromiseResult } from "aws-sdk/lib/request";
import axios, { AxiosInstance, AxiosResponse } from "axios";

export class SecurityGroupHelper {
    private readonly _ipAddressProviderUrl = "http://api.ipify.org";
    private readonly _axiosInstance: AxiosInstance;
    private readonly _ec2: AWS.EC2;
    private readonly _stackName: string;

    constructor(stackName: string) {
        this._stackName = stackName;
        this._ec2 = new AWS.EC2({apiVersion: "2016-11-15"});
        this._axiosInstance = axios.create({
            baseURL: this._ipAddressProviderUrl,
            responseType: "json"
        });
    }

    public async createSecurityGroup(): Promise<string | void> {
        const ip = await this._axiosInstance.get("/?format=json").then(
            (response: AxiosResponse) => {
                return response.data.ip;
            }
        ).catch(
            (error) => {
                console.log("Could not determine IP Address, received error: " + error);
            }
        );
        if (!ip) {
            return undefined;
        }

        console.log("IP Address for Security Group: " + ip);

        const securityGroupId: string | void = await this.getDefaultVpc().then(
            (describeVpcsResult: AWS.EC2.DescribeVpcsResult) => {
                if (describeVpcsResult.Vpcs && describeVpcsResult.Vpcs.length > 0 && describeVpcsResult.Vpcs[0].VpcId) {
                    console.log("Default VPC: " + describeVpcsResult.Vpcs[0].VpcId);
                    return describeVpcsResult.Vpcs[0].VpcId;
                } else {
                    throw new Error("Could not determine default VpcId");
                }
            }
        ).then(
            (vpcId: AWS.EC2.VpcId) => {
                return this.createSecurityGroupInVpc(vpcId);
            }
        ).then(
            (createSecurityGroupResult: AWS.EC2.CreateSecurityGroupResult) => {
                if (createSecurityGroupResult.GroupId) {
                    return createSecurityGroupResult.GroupId;
                } else {
                    throw new Error("Unable to create security group");
                }
            }
        ).then(
            (createdSecurityGroupId: string) => {
                this.authorizeSecurityGroupIngress(createdSecurityGroupId, ip);
                return createdSecurityGroupId;
            }
        ).catch(
            (error) => {
                console.log(error);
            }
        );

        console.log("Created Security Group: " + securityGroupId);

        return securityGroupId;
    }

    private getDefaultVpc(): Promise<AWS.EC2.DescribeVpcsResult> {
        const params = {
            Filters: [
                {
                    Name: "isDefault",
                    Values: [ "true" ]
                }
            ]
        };
        return this._ec2.describeVpcs(params).promise();
    }

    private createSecurityGroupInVpc(vpcId: AWS.EC2.VpcId): Promise<AWS.EC2.CreateSecurityGroupResult> {
        const params = {
            Description: "E2E RestAPI testing HTTP port 80 for stack: " + this._stackName,
            GroupName: this._stackName + "-e2e-rest-api-testing-security-group",
            VpcId: vpcId,
            TagSpecifications: [
                {
                    ResourceType: "security-group",
                    Tags: [
                        {
                            Key: "kai-e2e-testing-stack-name",
                            Value: this._stackName
                        },
                    ]
                }
            ]
        };
        console.log("Creating security group with params: " + JSON.stringify(params));
        return this._ec2.createSecurityGroup(params).promise();
    }

    private authorizeSecurityGroupIngress(securityGroupId: string, ipAddress: string): Promise<PromiseResult<Record<string, unknown>, AWS.AWSError>> {
        const params = {
            GroupId: securityGroupId,
            IpPermissions: [
                {
                    FromPort: 80,
                    IpProtocol: "tcp",
                    IpRanges: [
                        {
                            CidrIp: ipAddress + "/32",
                            Description: "E2E Testing Rest API Security Group"
                        }
                    ],
                    ToPort: 80
                }
            ]
        };
        console.log("Adding security group ingress using params: " + JSON.stringify(params));
        return this._ec2.authorizeSecurityGroupIngress(params).promise();
    }

    public async deleteSecurityGroup(securityGroupId: string): Promise<void> {
        const params = {
            GroupId: securityGroupId
        };
        await this._ec2.deleteSecurityGroup(params).promise().then(
            () => {
                console.log("Successfully deleted security group: " + securityGroupId);
            }
        ).catch((error) => {
            console.log(error.message);
        });
    }
}