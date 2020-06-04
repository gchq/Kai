import { Queue } from "@aws-cdk/aws-sqs";
import { ILayerVersion } from "@aws-cdk/aws-lambda";
import { ICluster } from "@aws-cdk/aws-eks";

export interface WorkerProps {
    queue: Queue
    kubectl_layer: ILayerVersion,
    cluster: ICluster
}