import { Queue } from "@aws-cdk/aws-sqs";
import { ILayerVersion } from "@aws-cdk/aws-lambda";
import { Cluster } from "@aws-cdk/aws-eks";

export interface WorkerProps {
    queue: Queue
    kubectlLayer: ILayerVersion,
    cluster: Cluster
}