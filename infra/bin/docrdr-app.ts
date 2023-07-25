#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { DocrdrAppStack } from '../lib/docrdr-app-stack';
import { AwsSolutionsChecks } from 'cdk-nag'

const vpcId = process.env.DOCRDR_VPC_ID
const bastionCIDR = process.env.DOCRDR_BASTION_CIDR

const app = new cdk.App({
    context: {
        vpcId, bastionCIDR
    }
});

new DocrdrAppStack(app, 'DocrdrAppStack', {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT, 
        region: process.env.CDK_DEFAULT_REGION 
    }
});

cdk.Aspects.of(app).add(new AwsSolutionsChecks())
