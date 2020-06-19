import * as cdk from "@aws-cdk/core";
import * as dynamo from "@aws-cdk/aws-dynamodb"

/**
 * The underlying database for Graphs.
 */
export class GraphDatabase extends cdk.Construct {
    private readonly _table: dynamo.Table;

    constructor(scope: cdk.Construct, id: string) { // todo add tests
        super(scope, id);
        
        // Table

        this._table = new dynamo.Table(this, "GraphDynamoTable", {
            partitionKey: { name: "graphId", type: dynamo.AttributeType.STRING },
            billingMode: dynamo.BillingMode.PROVISIONED,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });

        // Autoscaling

        const scalingProps: dynamo.EnableScalingProps = {
            minCapacity: 1,
            maxCapacity: 25 // todo move these values into variables 
        }

        const utilisationProps: dynamo.UtilizationScalingProps = {
            targetUtilizationPercent: 80
        }

        const readScaling  = this._table.autoScaleReadCapacity(scalingProps);
        readScaling.scaleOnUtilization(utilisationProps);

        const writeScaling = this._table.autoScaleWriteCapacity(scalingProps);
        writeScaling.scaleOnUtilization(utilisationProps);

    }

    public get table(): dynamo.Table {
        return this._table;
    }
}