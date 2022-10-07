import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as elasticache from 'aws-cdk-lib/aws-elasticache';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { NagSuppressions } from 'cdk-nag'

export class DocrdrAppModernCacheStack extends Stack {

  constructor(scope: Construct, id: string, vpc: ec2.IVpc, props?: StackProps) {
    super(scope, id, props);

    const subnetGroup = new elasticache.CfnSubnetGroup(this, "CacheSubnetGroup", {
      subnetIds: vpc.privateSubnets.map (subnet => subnet.subnetId),
      description: "Group of subnets to place Cache into",
    });
    const securityGroup = new ec2.SecurityGroup(this, "CacheSecurityGroup", { vpc });
    securityGroup.addIngressRule(ec2.Peer.ipv4(vpc.vpcCidrBlock), ec2.Port.tcp(6379), "Ingress from Fargate containers");

    const cacheCluster = new elasticache.CfnCacheCluster(this, "CacheCluster", {
      engine: "redis",
      cacheNodeType: "cache.t3.micro",
      numCacheNodes: 1,
      cacheSubnetGroupName: subnetGroup.ref,
      vpcSecurityGroupIds: [securityGroup.securityGroupId],
    });

    new CfnOutput(this, 'ModernAppWorkshopCacheHost', {
      value: `${cacheCluster.attrRedisEndpointAddress}`,
    });
    new CfnOutput(this, 'ModernAppWorkshopCachePort', {
      value: `${cacheCluster.attrRedisEndpointPort}`,
    });

    NagSuppressions.addResourceSuppressions(cacheCluster, [
      {
        id: 'AwsSolutions-AEC5',
        reason: 'For workshops we use default cache port for being easy to understand.'
      },
    ]);
  }
}
