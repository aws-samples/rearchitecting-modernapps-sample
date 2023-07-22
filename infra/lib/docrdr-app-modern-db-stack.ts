import { Stack, StackProps, Tags, SecretValue, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';

import { NagSuppressions } from 'cdk-nag'

export class DocrdrAppModernDbStack extends Stack {

  constructor(scope: Construct, id: string, databaseHostname: string, props?: StackProps) {
    super(scope, id, props);

    const databaseUsername = this.node.tryGetContext('databaseUsername');
    const databasePassword = this.node.tryGetContext('databasePassword');

    const databaseConnection = new secretsmanager.Secret(this, 'DatabaseConnection', {
      secretObjectValue: {
        hostname: SecretValue.unsafePlainText(databaseHostname),
        username: SecretValue.unsafePlainText(databaseUsername),
        password: SecretValue.unsafePlainText(databasePassword),
      },
    });

    // For copilot reference: https://aws.github.io/copilot-cli/docs/developing/secrets/
    Tags.of(databaseConnection).add('copilot-application', 'docrdr');
    Tags.of(databaseConnection).add('copilot-environment', 'prod');

    new CfnOutput(this, 'ModernAppWorkshopDatabaseSecretName', {
      value: `${databaseConnection.secretName}`,
    });

    NagSuppressions.addResourceSuppressions(databaseConnection, [
      {
        id: 'AwsSolutions-SMG4',
        reason: 'True Positive with compensating controls: For workshops we do not use secrets rotation to simplify intructions.'
      },
    ]);
  }
}
