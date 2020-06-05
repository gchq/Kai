import { NodegroupOptions } from "@aws-cdk/aws-eks";
import { InstanceType } from "@aws-cdk/aws-ec2";

export interface INodeGroupConfig {
    instanceType?: string;
    minSize?: number;
    maxSize?: number;
    desiredSize?: number; 
}

export class NodeGroupConfig implements INodeGroupConfig {
    
    public static readonly DEFAULT_NODE_GROUP: NodegroupOptions = {
        instanceType: new InstanceType("t3.medium"),
        minSize: 1,
        maxSize: 10,
        desiredSize: 2
    }

    private readonly _instanceType: string | undefined;
    private readonly _minSize: number | undefined;
    private readonly _maxSize: number | undefined;
    private readonly _desiredSize: number | undefined;

    constructor(
        instanceType?: string,
        minSize?: number,
        maxSize?: number,
        desiredSize?: number
    ) {
        this._instanceType = instanceType;
        this._minSize = minSize;
        this._maxSize = maxSize;
        this._desiredSize = desiredSize;
    }

    public get instanceType(): string | undefined {
        return this._instanceType;
    }

    public get minSize(): number | undefined {
        return this._minSize;
    }

    public get maxSize(): number | undefined {
        return this._maxSize;
    }

    public get desiredSize(): number | undefined {
        return this._desiredSize;
    }

    /**
     * Performs a typesafe conversion into a NodeGroupConfig class
     * @param config config object
     */
    public static fromConfig(config: INodeGroupConfig): NodeGroupConfig {
        if (NodeGroupConfig.isConfig(config)) {
            return new NodeGroupConfig(config.instanceType, config.minSize, config.maxSize, config.desiredSize);
        } else {
            throw new Error(config + " is not a valid Node group config");
        }
    }

    private static isConfig(obj: INodeGroupConfig): obj is INodeGroupConfig {
        if (obj == null) {
            return false;
        }

        return (obj.instanceType == null || typeof obj.instanceType == "string") &&
        (obj.minSize == null || typeof obj.minSize == "number") &&
        (obj.maxSize == null || typeof obj.maxSize == "number") &&
        (obj.desiredSize == null || typeof obj.desiredSize == "number");
    }

    /**
     * Converts this config object into one that can be used with the CDK.
     */
    public toNodeGroupOptions(): NodegroupOptions {
        return {
            instanceType: this.instanceType != null ? new InstanceType(this.instanceType) : NodeGroupConfig.DEFAULT_NODE_GROUP.instanceType,
            maxSize: this.maxSize != null ? this.maxSize : NodeGroupConfig.DEFAULT_NODE_GROUP.maxSize,
            minSize: this.minSize != null ? this.minSize : NodeGroupConfig.DEFAULT_NODE_GROUP.minSize,
            desiredSize: this.desiredSize != null ? this.desiredSize : NodeGroupConfig.DEFAULT_NODE_GROUP.desiredSize
        };
    }
}