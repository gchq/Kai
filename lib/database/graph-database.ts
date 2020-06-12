import * as cdk from "@aws-cdk/core";
import * as dynamo from "@aws-cdk/aws-dynamodb"
import { read } from "fs";

/**
 * The underlying database for Graphs.
 */
export class GraphDatabase extends cdk.Construct {
    private readonly _tableName: string;

    constructor(scope: cdk.Construct, id: string) { // todo add tests
        super(scope, id);
        
        // Table

        const table = new dynamo.Table(this, "GraphDynamoTable", {
            partitionKey: { name: "graphId", type: dynamo.AttributeType.STRING },
            billingMode: dynamo.BillingMode.PROVISIONED,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });

        this._tableName = table.tableName;

        // Autoscaling

        const scalingProps: dynamo.EnableScalingProps = {
            minCapacity: 1,
            maxCapacity: 25 // todo move these values into variables 
        }

        const utilisationProps: dynamo.UtilizationScalingProps = {
            targetUtilizationPercent: 80
        }

        const readScaling  = table.autoScaleReadCapacity(scalingProps);
        readScaling.scaleOnUtilization(utilisationProps);

        const writeScaling = table.autoScaleWriteCapacity(scalingProps);
        writeScaling.scaleOnUtilization(utilisationProps);

    }

    public get tableName(): string {
        return this._tableName;
    }
}