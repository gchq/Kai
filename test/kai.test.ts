import { SynthUtils } from '@aws-cdk/assert';
import cdk = require('@aws-cdk/core');
import Kai = require('../lib/kai-stack');

test('Stack matches the snapshot', () => {
    // Given
    const app = new cdk.App();
    // When
    const stack = new Kai.KaiStack(app, 'MyTestStack');
    // Then
    expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
});