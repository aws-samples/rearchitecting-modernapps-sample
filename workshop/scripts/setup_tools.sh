#!/usr/bin/env bash

# AWS CLI v2
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Install prerequisites 
sudo yum install -y jq

# Docker Compose プラグインのインストール
wget https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64
chmod +x docker-compose-linux-x86_64
sudo mv docker-compose-linux-x86_64 /usr/libexec/docker/cli-plugins/docker-compose

# copilot-cli のインストール
sudo curl -Lo /usr/local/bin/copilot https://github.com/aws/copilot-cli/releases/download/v1.21.1/copilot-linux && sudo chmod +x /usr/local/bin/copilot && copilot version


# copilot-cli で使用する環境変数などのセットアップ
echo "export AWS_DEFAULT_REGION=$(curl -s 169.254.169.254/latest/dynamic/instance-identity/document | jq -r .region)" >> ~/.bashrc
source ~/.bashrc

mkdir -p ~/.aws

cat << EOF > ~/.aws/config
[default]
region = ${AWS_DEFAULT_REGION}
output = json
EOF
