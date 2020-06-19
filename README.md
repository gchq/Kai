Kai
==================
Kai is an experimental Graph as a Service application built on AWS. It uses the Amazon CDK.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run lint`    run the eslint style checking
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template

## Configuration

Kai has a number of different properties which can be altered using the `cdk.json` file or by passing 
in context objects through the --context option

Name                       | Type          | Default value | Description
---------------------------|---------------|---------------|----------------
vpcId                      | string        | "DEFAULT"     | The Vpc that the eks cluster will use. By default it uses the default VPC for the account you're deploying with. If this is removed, a VPC will be created. If a VPC id is specified it will use that VPC.
clusterName                | string        | "Kai"         | The Name of the EKS cluster that will be created
extraIngressSecurityGroups | string        | ""            | Additional vpcs that will be added to every application load balancer that comes with a gaffer deployment. To Add multiple ones, use a comma seperated list eg "sg-xxxxxxxxx, sg-yyyyyyyyyy". The security group of the EKS cluster is automatically added.
globalTags                 | object        | {}            | Tags that get added to every taggable resource.
clusterNodeGroup           | object        | null          | Configuration for the eks cluster nodegroup. See below for details.
userPoolConfiguration      | object        | null          | Cognito UserPool configuration. See below for details.

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

## Cognito UserPool configuration

By default Kai uses a vanilla AWS Cognito UserPool to manage authentication with the application.
The default UserPool and UserPoolClient settings can be overridden by supplying a `userPoolConfiguration` context option populated as shown here:
```json
{
    "defaultPoolConfig": {
        "userPoolProps": {
            <@aws-cdk/aws-cognito.UserPoolProps> // todo make these not show up red
        },
        "userPoolClientOptions": {
            <@aws-cdk/aws-cognito.UserPoolClientOptions>
        }
    }
}
```
Alternatively a pre-configured external pool can be referenced using the following example:
```json
{
    "externalPool": {
        "userPoolId": <external-user-pool-id>,
        "userPoolClientId": <external-user-pool-client-id>
    }
}
```
