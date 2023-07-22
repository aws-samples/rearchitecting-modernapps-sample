#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { DocrdrAppStack } from '../lib/docrdr-app-stack';
import { DocrdrAppModernDbStack } from '../lib/docrdr-app-modern-db-stack';
import { DocrdrAppModernCacheStack } from '../lib/docrdr-app-modern-cache-stack';
import { AwsSolutionsChecks } from 'cdk-nag'

const databaseUsername = 'admin'
const databasePassword = 'adminadmin'
const bastionCIDR = process.env.DOCRDR_BASTION_CIDR

const app = new cdk.App({
    context: {
        databaseUsername, databasePassword, bastionCIDR
    }
});

const baseStack = new DocrdrAppStack(app, 'DocrdrAppStack');
new DocrdrAppModernDbStack(app, 'DocrdrAppModernDbStack', baseStack.databaseHostname, {});
new DocrdrAppModernCacheStack(app, 'DocrdrAppModernCacheStack', baseStack.vpc, {});

cdk.Aspects.of(app).add(new AwsSolutionsChecks())
