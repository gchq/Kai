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
import * as dynamo from "@aws-cdk/aws-dynamodb";
import { GraphDatabaseProps } from "./graph-database-props";

/**
 * The underlying database for Graphs.
 */
export class GraphDatabase extends cdk.Construct {
    private readonly _table: dynamo.Table;

    constructor(scope: cdk.Construct, id: string, props: GraphDatabaseProps) {
        super(scope, id);
        
        // Table

        this._table = new dynamo.Table(this, "GraphDynamoTable", {
            partitionKey: { name: "graphId", type: dynamo.AttributeType.STRING },
            billingMode: dynamo.BillingMode.PROVISIONED,
            removalPolicy: cdk.RemovalPolicy.DESTROY
        });

        // Autoscaling

        const scalingProps: dynamo.EnableScalingProps = {
            minCapacity: props.minCapacity,
            maxCapacity: props.maxCapacity
        };

        const utilisationProps: dynamo.UtilizationScalingProps = {
            targetUtilizationPercent: props.targetUtilizationPercent
        };

        const readScaling  = this._table.autoScaleReadCapacity(scalingProps);
        readScaling.scaleOnUtilization(utilisationProps);

        const writeScaling = this._table.autoScaleWriteCapacity(scalingProps);
        writeScaling.scaleOnUtilization(utilisationProps);

    }

    public get table(): dynamo.Table {
        return this._table;
    }
}