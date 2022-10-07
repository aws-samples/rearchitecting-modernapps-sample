#!/bin/sh

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