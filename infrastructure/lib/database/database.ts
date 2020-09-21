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
import { DatabaseProps, ScalingProps } from "./database-props";

/**
 * The underlying database for Graphs.
 */
export class Database extends cdk.Construct {
    private readonly _graphTable: dynamo.Table;
    private readonly _namespaceTable: dynamo.Table;

    constructor(scope: cdk.Construct, id: string, props: DatabaseProps) {
        super(scope, id);

        this._graphTable = new dynamo.Table(this, "GraphDynamoTable", {
            partitionKey: { name: "releaseName", type: dynamo.AttributeType.STRING },
            billingMode: dynamo.BillingMode.PROVISIONED,
            removalPolicy: cdk.RemovalPolicy.DESTROY
        });

        this.configureAutoScaling(this._graphTable, props.graphTableScalingProps);

        this._namespaceTable = new dynamo.Table(this, "NamespaceDynamoTable", {
            partitionKey: { name: "namespaceName", type: dynamo.AttributeType.STRING },
            billingMode: dynamo.BillingMode.PROVISIONED,
            removalPolicy: cdk.RemovalPolicy.DESTROY
        });

        this.configureAutoScaling(this._namespaceTable, props.namespaceTableScalingProps);
    }

    private configureAutoScaling(table: dynamo.Table, props: ScalingProps): void {
        const scalingProps: dynamo.EnableScalingProps = {
            minCapacity: props.minCapacity,
            maxCapacity: props.maxCapacity
        };

        const utilisationProps: dynamo.UtilizationScalingProps = {
            targetUtilizationPercent: props.targetUtilizationPercent
        };

        const readScaling = table.autoScaleReadCapacity(scalingProps);
        readScaling.scaleOnUtilization(utilisationProps);

        const writeScaling = table.autoScaleWriteCapacity(scalingProps);
        writeScaling.scaleOnUtilization(utilisationProps);
    }

    public get graphTable(): dynamo.Table {
        return this._graphTable;
    }

    public get namespaceTable(): dynamo.Table {
        return this._namespaceTable;
    }
}
