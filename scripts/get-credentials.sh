#!/usr/bin/env bash


# Detect if the script is being sourced
# $0 is the script name, $BASH_SOURCE[0] is the source file
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  echo "This script needs to be sourced. Invoke as source ./script.sh <AWS_PROFILE>"
  exit
fi

AWS_PROFILE=$1

echo "Unsetting existing AWS credentials..."
unset AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_SESSION_TOKEN

echo "Checking if AWS credentials are valid..."
aws sts get-caller-identity --profile $AWS_PROFILE &> /dev/null
EXIT_CODE=$? # 0 if success, 1 if failure
if [ $EXIT_CODE -ne 0 ]; then
  echo "AWS credentials are no longer valid. Authenticating..."
  aws sso login --profile $AWS_PROFILE > /dev/null
fi

echo "Exporting AWS credentials..."
eval "$(aws configure export-credentials --profile $AWS_PROFILE --format env)"

echo "Credentials set for ${AWS_PROFILE}"