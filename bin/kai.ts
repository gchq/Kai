#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import { KaiStack } from '../lib/kai-stack';

const app = new cdk.App();
new KaiStack(app, 'KaiStack');
