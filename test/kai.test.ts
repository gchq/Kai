import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import cdk = require('@aws-cdk/core');
import Kai = require('../lib/kai-stack');

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new Kai.KaiStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});