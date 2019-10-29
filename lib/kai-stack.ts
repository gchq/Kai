import cdk = require('@aws-cdk/core');
import { GraphService } from './graph-service';

export class KaiStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new GraphService(this, 'Graphs');


  }
}
