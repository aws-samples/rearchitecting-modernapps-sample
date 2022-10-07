import { Stack, StackProps, CfnOutput, RemovalPolicy, SecretValue } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as elbv2_targets from 'aws-cdk-lib/aws-elasticloadbalancingv2-targets';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import { NagSuppressions } from 'cdk-nag'

export class DocrdrAppStack extends Stack {

  public readonly vpc: ec2.IVpc;

  public readonly databaseHostname: string;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'Vpc');
    this.vpc = vpc;

    const securityGroup = new ec2.SecurityGroup(this, "SecurityGroup", {
      vpc,
      description: "Allow SSH (TCP port 22) and HTTP (TCP port 80) in",
      allowAllOutbound: true,
    });

    const bastionCIDR = this.node.tryGetContext('bastionCIDR');

    // From bastion
    const bastionSource = (bastionCIDR) ? ec2.Peer.ipv4(bastionCIDR) : ec2.Peer.anyIpv4();
    securityGroup.addIngressRule(
      bastionSource,
      ec2.Port.tcp(22),
      "Allow SSH Access"
    );

    const machineImage = new ec2.AmazonLinuxImage({
      generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      cpuType: ec2.AmazonLinuxCpuType.X86_64,
    });

    const role = new iam.Role(this, "ec2Role", {
      assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com"),
    })
    role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonSSMManagedInstanceCore")
    );
    role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("TranslateReadOnly")
    );
    role.addToPolicy(new iam.PolicyStatement({
      actions: ['cloudformation:DescribeStacks'],
      resources: ['*'],
    }));
    const keyName = 'modernapp-workshop-key';
    const cfnKeyPair = new ec2.CfnKeyPair(this, 'CfnKeyPair', {
      keyName,
    });
    cfnKeyPair.applyRemovalPolicy(RemovalPolicy.DESTROY)

    const instance = new ec2.Instance(this, "Instance", {
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO
      ),
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      vpc,
      machineImage,
      securityGroup,
      keyName,
      role,
    });

    const lb = new elbv2.ApplicationLoadBalancer(this, 'LB', {
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      internetFacing: true
    });
    const listener = lb.addListener('Listener', {
      port: 80,
    });
    listener.addTargets('ApplicationTarget', {
      port: 8080,
      targets: [new elbv2_targets.InstanceTarget(instance)]
    });
    // From LB to the instance
    lb.connections.securityGroups.forEach(sg => {
      sg.addEgressRule(
        securityGroup,
        ec2.Port.tcp(8080),
        "LB to Tomcat");
      securityGroup.addIngressRule(
        sg,
        ec2.Port.tcp(8080),
        "LB to Tomcat"
      );
    });

    // DB
    const databaseUsername = this.node.tryGetContext('databaseUsername')
    const databasePassword = this.node.tryGetContext('databasePassword')

    const cluster = new rds.DatabaseCluster(this, 'Database', {
      engine: rds.DatabaseClusterEngine.auroraMysql({ version: rds.AuroraMysqlEngineVersion.VER_3_02_0 }),
      credentials: rds.Credentials.fromPassword(databaseUsername, SecretValue.unsafePlainText(databasePassword)),
      storageEncrypted: true,
      instances: 1,
      instanceProps: {
        instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE3, ec2.InstanceSize.MEDIUM),
        vpcSubnets: {
          subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
        },
        vpc,
      },
      parameters: {
        character_set_client: 'utf8mb4',
        character_set_connection: 'utf8mb4',
        character_set_database: 'utf8mb4',
        character_set_results: 'utf8mb4',
        character_set_server: 'utf8mb4',
        collation_connection: 'utf8mb4_bin',
        collation_server: 'utf8mb4_bin',
      },
    });
    cluster.connections.allowFrom(ec2.Peer.ipv4(vpc.vpcCidrBlock), ec2.Port.tcp(3306));
    this.databaseHostname = cluster.clusterEndpoint.hostname;

    new CfnOutput(this, 'ModernAppWorkshopGetSSHKeyCommand', {
      value: `aws ssm get-parameter --name /ec2/keypair/${cfnKeyPair.attrKeyPairId} --region ${this.region} --with-decryption --query Parameter.Value --output text`,
    });
    new CfnOutput(this, 'ModernAppWorkshopSSHAccess', {
      value: `ec2-user@${instance.instancePublicIp}`,
    });
    new CfnOutput(this, 'ModernAppWorkshopApplicationURL', {
      value: `http://${lb.loadBalancerDnsName}/`,
    });
    new CfnOutput(this, 'ModernAppWorkshopDatabaseHost', {
      value: `${this.databaseHostname}`,
    });

    // NAG
    NagSuppressions.addResourceSuppressions(securityGroup, [
      {
        id: 'AwsSolutions-EC23',
        reason: 'For workshops we only publish LB port to the world'
      },
    ], true);
    NagSuppressions.addResourceSuppressions(lb, [
      {
        id: 'AwsSolutions-EC23',
        reason: 'For workshops we only publish LB port to the world'
      },
    ], true);
    NagSuppressions.addStackSuppressions(this, [
      {
        id: 'AwsSolutions-VPC7',
        reason: 'VPC Flow Log is not used for the workshop.'
      },
      {
        id: 'AwsSolutions-IAM4',
        reason: 'We use AWS managed policies for making a guardrail.'
      },
      {
        id: 'AwsSolutions-IAM5',
        reason: 'We use the wildcard for reading CFn outputs for the workshop.'
      },
      {
        id: 'AwsSolutions-EC28',
        reason: 'For workshops we do not have detailed monitoring enabled for cost reduction.'
      },
      {
        id: 'AwsSolutions-EC29',
        reason: 'For workshops we do not have a EC2 instance joined to ASG for simplifying intructions.'
      },
      {
        id: 'AwsSolutions-ELB2',
        reason: 'For workshops we do not use ELB access log.'
      },
      {
        id: 'AwsSolutions-RDS6',
        reason: 'For workshops we use username/password to demonstrate legacy env.'
      },
      {
        id: 'AwsSolutions-RDS10',
        reason: 'For workshops we do not use deletion protection for simplifying intructions.'
      },
      {
        id: 'AwsSolutions-RDS11',
        reason: 'For workshops we use default MySQL port to demonstrate legacy env.'
      },
      {
        id: 'AwsSolutions-RDS14',
        reason: 'For workshops we do not use backtraco to reduce cost.'
      },
    ]);
  }
}
