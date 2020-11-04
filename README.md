Kai
==================
Kai is an experimental Graph as a Service application built on AWS. It uses the Amazon CDK.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

NOTE: As Kai is currently early in development and likely subject to breaking changes, we do not advise this product be used in any production capacity.
If you have an interest in using Kai in production, please watch this repository to stay updated.

## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run lint`    run the eslint style checking
 * `npm run test`    perform the jest unit tests
 * `npm run e2e`     run end to end jest integration tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template

## Configuration

Kai has a number of different properties which can be altered using the `cdk.json` file or by passing 
in context objects through the --context option

Name                       | Type          | Default value | Description
---------------------------|---------------|---------------|----------------
vpcId                      | string        | "DEFAULT"     | The Vpc that the eks cluster will use. By default it uses the default VPC for the account you're deploying with. If this is removed, a VPC will be created. If a VPC id is specified it will use that VPC.
extraIngressSecurityGroups | string        | ""            | Additional vpcs that will be added to every application load balancer that comes with a gaffer deployment. To Add multiple ones, use a comma seperated list eg "sg-xxxxxxxxx, sg-yyyyyyyyyy". The security group of the EKS cluster is automatically added.
globalTags                 | object        | {}            | Tags that get added to every taggable resource.
clusterNodeGroup           | object        | null          | Configuration for the eks cluster nodegroup. See below for details.
userPoolConfiguration      | object        | null          | Cognito UserPool configuration. See below for details.
databaseProps              | object        | see cdk.json  | Configuration for Dynamodb table autoscaling.

## Changing the nodegroup properties

By default, Kai ships with a nodegroup with the following parameters:
```json
{
    "instanceType": "m3.medium",
    "minSize": 1,
    "maxSize": 10,
    "preferredSize": 2
}
```

These properties are changeable through the context variable: "clusterNodeGroup".

## Database Autoscaling
Depending on your needs, you may want to change the autoscaling properties of the Graph and Namespace tables in the Dynamodb Database. The default properties in the cdk.json file are as follows:
```json
{
    "databaseProps": {
        "graphTableScalingProps": {
            "minCapacity": 1,
            "maxCapacity": 25,
            "targetUtilizationPercent": 80
        },
        "namespaceTableScalingProps": {
            "minCapacity": 1,
            "maxCapacity": 25,
            "targetUtilizationPercent": 80
        }
    }
}
```
The min and max capacity relate to amazon's [read and write capacity units](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ProvisionedThroughput.html#ProvisionedThroughput.CapacityUnits.Read)

These settings haven't yet been tested at production scale so may change when we do.

## Cognito UserPool configuration

By default Kai uses a vanilla AWS Cognito UserPool to manage authentication with the application.
The default UserPool and UserPoolClient settings can be overridden by supplying a `userPoolConfiguration` context option populated as shown here:
```json
{
    "defaultPoolConfig": {
        "userPoolProps": {
            "selfSignUpEnabled": false // See below for full options
        },
        "userPoolClientOptions": {
            "disableOAuth": true // See below for full options
        }
    }
}
```
The full list of [userPoolProps](https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_aws-cognito.UserPoolProps.html) and [userPoolClientOptions](https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_aws-cognito.UserPoolClientOptions.html) can be found on Amazon's docs

Alternatively a pre-configured external pool can be referenced using the following example:
```json
{
    "externalPool": {
        "userPoolId": "myRegion_userPoolId",
        "userPoolClientId": "randomString"
    }
}
```
