import { Cluster } from "@aws-cdk/aws-eks";

export interface KaiRestApiProps {
    cluster: Cluster
}