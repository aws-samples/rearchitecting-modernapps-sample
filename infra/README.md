# Deploy Legacy Apps

## Create a virtual machine / Database for the app.

```bash
npm install

npm run cdk diff
npm run cdk deploy
```

## SSH to the virtual machine

```bash
## Save SSH key from CloudFormation Outputs
eval $(aws cloudformation describe-stacks --stack-name DocrdrAppStack --query 'Stacks[].Outputs[?OutputKey==`ModernAppWorkshopGetSSHKeyCommand`].[OutputValue]' --output text) > ./tmp/modernapps-workshop-key
chmod 400 ./tmp/modernapps-workshop-key

export SSH_ACCESS=$(aws cloudformation describe-stacks --stack-name DocrdrAppStack --query 'Stacks[].Outputs[?OutputKey==`ModernAppWorkshopSSHAccess`].[OutputValue]' --output text)
ssh $SSH_ACCESS -i ./tmp/modernapps-workshop-key
```
## Create the Database

```bash
## Confirm the output of `cdk deploy` command for RDS_ENDPOINT
export DATABASE_HOST=$(aws cloudformation describe-stacks --stack-name DocrdrAppStack --query 'Stacks[].Outputs[?OutputKey==`ModernAppWorkshopDatabaseHost`].[OutputValue]' --output text --region us-west-2)
mysql -h $DATABASE_HOST -u admin -p # Password: adminadmin
```
### Execute SQL for the App

```sql
CREATE DATABASE docrdr;
USE docrdr;
CREATE TABLE DOCUMENTS (ID CHAR(36) PRIMARY KEY, TITLE VARCHAR(255), URL VARCHAR(255), ORIGINAL TEXT);
```

## Install Tomcat on the machine

```bash
## Install Java17
sudo yum install java-17-amazon-corretto-headless

## Install Tomcat 10
wget https://dlcdn.apache.org/tomcat/tomcat-10/v10.0.22/bin/apache-tomcat-10.0.22.tar.gz
sudo mkdir /opt/tomcat10
sudo tar xzvf apache-tomcat-10.0.22.tar.gz -C /opt/tomcat10 --strip-components=1
sudo useradd -m -d /opt/tomcat10 -U -s /sbin/nologin tomcat10
sudo chown -R tomcat10:tomcat10 /opt/tomcat10/
sudo chmod -R u+x /opt/tomcat10/bin

## Set the tomcat service up

sudo tee /etc/systemd/system/tomcat10.service <<EOF
[Unit]
Description=Tomcat 10
After=network.target

[Service]
Type=forking

User=tomcat10
Group=tomcat10

Environment="CATALINA_BASE=/opt/tomcat10"
Environment="CATALINA_HOME=/opt/tomcat10"
Environment="CATALINA_PID=/opt/tomcat10/temp/tomcat.pid"
Environment="CATALINA_OPTS=-Xms512M -Xmx512M -server -XX:+UseParallelGC"

ExecStart=/opt/tomcat10/bin/startup.sh
ExecStop=/opt/tomcat10/bin/shutdown.sh

RestartSec=10
Restart=always

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl start tomcat10

systemctl status tomcat10
```

## Deploy the application to the Tomcat

```bash
## logout from Virtual Machine
exit

cd modernapps-rearchitecting-workshop/applications/legacy/docrdr

## Configure logging for environment in production
scp -i ./tmp/modernapps-workshop-key ./scripts/log4j2.xml $SSH_ACCESS:~
ssh -i ./tmp/modernapps-workshop-key $SSH_ACCESS "sudo cp log4j2.xml /opt/tomcat10/conf/"

## Create context.xml for environment in production

export DATABASE_HOST=$(aws cloudformation describe-stacks --stack-name DocrdrAppStack --query 'Stacks[].Outputs[?OutputKey==`ModernAppWorkshopDatabaseHost`].[OutputValue]' --output text --region us-west-2)
export TARGET_LANGUAGE=ja # The target language the app translates a document in

tee ./tmp/context.xml <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<Context>
  <Parameter name="TARGET_LANGUAGE" value="${TARGET_LANGUAGE}" />
  <Parameter name="log4jConfiguration" value="/opt/tomcat10/conf/log4j2.xml" />
  <Resource
    name="jdbc/MainDB"
    auth="Container"
    type="javax.sql.DataSource"
    maxTotal="100"
    maxIdle="30"
    maxWaitMillis="10000"
    username="admin"
    password="adminadmin"
    driverClassName="com.mysql.cj.jdbc.Driver"
    url="jdbc:mysql://${DATABASE_HOST}:3306/docrdr" />
</Context>
EOF

## Copy the context.xml to the server
scp -i ./tmp/modernapps-workshop-key ./tmp/context.xml $SSH_ACCESS:~
ssh -i ./tmp/modernapps-workshop-key $SSH_ACCESS "sudo cp context.xml /opt/tomcat10/conf/Catalina/localhost/ROOT.xml"

## Copy the war to the server
scp -i ../docrdr-app/tmp/modernapps-workshop-key ./app/build/libs/app.war $SSH_ACCESS:~
ssh -i ../docrdr-app/tmp/modernapps-workshop-key $SSH_ACCESS "sudo cp app.war /opt/tomcat10/webapps/ROOT.war"
```