import { Table } from "@aws-cdk/aws-dynamodb";

export interface KaiRestApiProps {
    graphTable: Table
}