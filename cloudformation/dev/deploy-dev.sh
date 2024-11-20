#!/bin/sh
# Largely inspired by:
# https://www.linkedin.com/pulse/deploying-dockerized-apps-aws-ec2-yana-veitsman/

STEP_01_VPC=1
STEP_02_SG=1
STEP_03_EC2=1
STEP_04_ECR=1
STEP_05_MIGRATIONS=1
STEP_06_API_SERVICE=1
STEP_07_CALLS_SERVICE=1
STEP_08_S3_CLOUDFRONT=1
STEP_09_FRONTEND_SERVICE=1

# Allow errors for credential setting
set +e

# Ensure no old AWS credentials are set in environment variables
echo "Unsetting old AWS credentials..."
unset AWS_ACCESS_KEY_ID
unset AWS_SECRET_ACCESS_KEY
unset AWS_SESSION_TOKEN
unset AWS_REGION
unset AWS_PROFILE
unset AWS_ACCOUNT_ID

# Set environment variables. Note, AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY must be set in the shell environment of the machine running this script.

# Confirm that the correct region is being used
AWS_REGION=us-east-1
export AWS_REGION=$AWS_REGION

# Confirm that the correct profile is being used
AWS_PROFILE=uc-dev
export AWS_PROFILE=$AWS_PROFILE

# 0. Login in with SSO locally
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

# Fetch secrets
echo "Fetching secrets..."
export $(aws secretsmanager get-secret-value --secret-id /dev/avoca/api-service --query SecretString --output text | jq -r 'to_entries | map("\(.key)=\(.value)") | .[]')
echo "Fetched secret for /dev/avoca/api-service"

# Now that we have logged in, we can grab the account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --profile $AWS_PROFILE --query Account --output text)

# Exit immediately if a command exits with a non-zero status
set -e

# If we need paramter overrides, add a .env.dev and --parameter-overrides $(cat .env.dev)

# 1. Deploy the AWS CloudFormation stack for the VPC
if [ "$STEP_01_VPC" -eq 1 ]; then
  echo "Deploying the AWS CloudFormation stack for the VPC..."
  aws cloudformation deploy \
    --profile $AWS_PROFILE \
    --region $AWS_REGION \
    --template-file dev-ue1-avoca-vpc.yaml \
    --stack-name dev-ue1-avoca-vpc \
    --capabilities CAPABILITY_IAM
    # --parameter-overrides $(cat .env.dev)
  echo "VPC stack deployed"
fi

# 2. Deploy the AWS CloudFormation stack for the Security Groups
if [ "$STEP_02_SG" -eq 1 ]; then
  echo "Deploying the AWS CloudFormation stack for the Security Groups..."
  aws cloudformation deploy \
    --profile $AWS_PROFILE \
    --region $AWS_REGION \
    --template-file dev-ue1-avoca-sg.yaml \
    --stack-name dev-ue1-avoca-sg \
    --capabilities CAPABILITY_IAM
    # --parameter-overrides $(cat .env.dev)
  echo "Security Groups deployed"
fi

# 3. Deploy the AWS CloudFormation stack for the EC2 instances
if [ "$STEP_03_EC2" -eq 1 ]; then
  echo "Deploying the AWS CloudFormation stack for the EC2 instances..."
  aws cloudformation deploy \
    --profile $AWS_PROFILE \
    --region $AWS_REGION \
    --template-file dev-ue1-avoca-ec2.yaml \
    --stack-name dev-ue1-avoca-ec2 \
    --capabilities CAPABILITY_IAM
    # --parameter-overrides $(cat .env.dev)
  echo "EC2 stack deployed"
fi

# 4. Deploy the ECR repositories
if [ "$STEP_04_ECR" -eq 1 ]; then
  echo "Deploying ECR repository..."
  aws cloudformation deploy \
    --profile $AWS_PROFILE \
    --region $AWS_REGION \
    --template-file dev-ue1-avoca-ecr.yaml \
    --stack-name dev-ec1-avoca-ecr \
    --capabilities CAPABILITY_IAM
    # --parameter-overrides $(cat .env.prod)
  echo "ECR repository deployed"
fi

# 5. Run migrations against the database
if [ "$STEP_05_MIGRATIONS" -eq 1 ]; then
  # Open an SSH tunnel and map local port 5432 to the remote database port
  echo "Opening SSH tunnel to database..."
  ssh dev-ue1-avoca-database-tunnel &
  SSH_TUNNEL_PID=$!
  sleep 3

  # Run the migrations
  echo "Running migrations..."
  npm --prefix ../../database-service install
  POSTGRES_HOST=127.0.0.1 POSTGRES_PORT=5432 POSTGRES_USER=$POSTGRES_USER POSTGRES_PASSWORD=$POSTGRES_PASSWORD POSTGRES_DB=$POSTGRES_DB npm --prefix ../../database-service run migration:up:dev

  # Close the SSH tunnel
  echo "Closing SSH tunnel..."
  kill $SSH_TUNNEL_PID
fi

# 6. Login to the ECR repository and build / push the Docker image
if [ "$STEP_06_API_SERVICE" -eq 1 ]; then
  echo "Logging into ECR..."

  # e.g., 123456789012.dkr.ecr.us-east-1.amazonaws.com/my-repo
  ECR_REPOSITORY="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/dev-ue1-avoca-api-container"
  echo "ECR Repository: $ECR_REPOSITORY"
  aws ecr get-login-password \
    --region $AWS_REGION | docker login \
    --username AWS \
    --password-stdin $ECR_REPOSITORY

  # 5. Build the docker image for the API Container
  # -f flag is used to specify the Dockerfile to use
  # -t flag is used to tag the image with a name and optionally a tag in the 'name:tag' format
  echo "Building Docker image..."
  IMAGE_NAME=dev-ue1-avoca-api-container
  DOCKERFILE_PATH=../../api-service/Dockerfile.dev
  DOCKERFILE_CONTEXT=../../api-service
  IMAGE_ID=$(docker build \
    -q \
    -t ${IMAGE_NAME} \
    -f ${DOCKERFILE_PATH} \
    ${DOCKERFILE_CONTEXT}
  )

  # Extract the image hash (ID)
  IMAGE_HASH=$(echo ${IMAGE_ID} | cut -d':' -f2)

  # Tag the image with the ECR repository URI
  echo "Tagging Docker image..."
  ECR_IMAGE_TAG="${ECR_REPOSITORY}:${IMAGE_HASH}"
  docker tag ${IMAGE_ID} ${ECR_IMAGE_TAG}

  # Push the image to the ECR repository
  echo "Pushing Docker image..."
  docker push $ECR_IMAGE_TAG

  # SSH into the EC2 Instance
  # This assumes an SSH profile is configured and already set up to tunnel via the Bastion instance
  # On a first time deploy, this would probably fail because we don't yet know the IP address for the EC2 instance
  echo "Establishing SSH connection to API container..."

  # SSH into the EC2 instance and run commands using local key file
  ssh dev-ue1-avoca-api << EOF
    # Commands to execute on the EC2 instance
    echo "SSH connection established"

    # Login to the ECR repository (should not be necessary due to EC2 IAM Instance Profile permissions)
    echo "Logging into ECR..."
    aws ecr get-login-password \
      --region $AWS_REGION | docker login \
      --username AWS \
      --password-stdin $ECR_REPOSITORY

    # Pull the latest image from the ECR repository
    # On a first time deploy, this would probably fail if we haven't given the EC2 instance permissions to access docker
    echo "Pulling Docker image..."
    docker pull $ECR_IMAGE_TAG

    # Stop the running container
    echo "Stopping running container..."
    docker stop $IMAGE_NAME || true

    # Remove the container
    echo "Removing container..."
    docker rm $IMAGE_NAME || true

    # Run the container on port 4000 mapped to port 4000 (the ALB maps 80 and 443 to 4000)
    echo "Running container..."
    docker run \
      -d \
      -p 4000:4000 \
      --name $IMAGE_NAME $ECR_IMAGE_TAG

    # Exit the SSH session
    echo "Exiting SSH session..."
    exit
EOF
fi

# 6. Login to the ECR repository and build / push the Docker image
if [ "$STEP_07_CALLS_SERVICE" -eq 1 ]; then
  echo "Logging into ECR..."

  # e.g., 123456789012.dkr.ecr.us-east-1.amazonaws.com/my-repo
  ECR_REPOSITORY="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/dev-ue1-avoca-calls-container"
  echo "ECR Repository: $ECR_REPOSITORY"
  aws ecr get-login-password \
    --region $AWS_REGION | docker login \
    --username AWS \
    --password-stdin $ECR_REPOSITORY

  # 5. Build the docker image for the API Container
  # -f flag is used to specify the Dockerfile to use
  # -t flag is used to tag the image with a name and optionally a tag in the 'name:tag' format
  echo "Building Docker image..."
  IMAGE_NAME=dev-ue1-avoca-calls-container
  DOCKERFILE_PATH=../../calls-service/Dockerfile.dev
  DOCKERFILE_CONTEXT=../../calls-service
  IMAGE_ID=$(docker build \
    -q \
    -t ${IMAGE_NAME} \
    -f ${DOCKERFILE_PATH} \
    ${DOCKERFILE_CONTEXT}
  )

  # Extract the image hash (ID)
  IMAGE_HASH=$(echo ${IMAGE_ID} | cut -d':' -f2)

  # Tag the image with the ECR repository URI
  echo "Tagging Docker image..."
  ECR_IMAGE_TAG="${ECR_REPOSITORY}:${IMAGE_HASH}"
  docker tag ${IMAGE_ID} ${ECR_IMAGE_TAG}

  # Push the image to the ECR repository
  echo "Pushing Docker image..."
  docker push $ECR_IMAGE_TAG

  # SSH into the EC2 Instance
  # This assumes an SSH profile is configured and already set up to tunnel via the Bastion instance
  # On a first time deploy, this would probably fail because we don't yet know the IP address for the EC2 instance
  echo "Establishing SSH connection to API container..."

  # SSH into the EC2 instance and run commands using local key file
  ssh dev-ue1-avoca-calls << EOF
    # Commands to execute on the EC2 instance
    echo "SSH connection established"

    # Login to the ECR repository (should not be necessary due to EC2 IAM Instance Profile permissions)
    echo "Logging into ECR..."
    aws ecr get-login-password \
      --region $AWS_REGION | docker login \
      --username AWS \
      --password-stdin $ECR_REPOSITORY

    # Pull the latest image from the ECR repository
    # On a first time deploy, this would probably fail if we haven't given the EC2 instance permissions to access docker
    echo "Pulling Docker image..."
    docker pull $ECR_IMAGE_TAG

    # Stop the running container
    echo "Stopping running container..."
    docker stop $IMAGE_NAME || true

    # Remove the container
    echo "Removing container..."
    docker rm $IMAGE_NAME || true

    # Run the container on port 8080 mapped to port 8080 (the ALB maps 80 and 443 to 8080)
    echo "Running container..."
    docker run \
      -d \
      -p 8080:8080 \
      --name $IMAGE_NAME $ECR_IMAGE_TAG

    # Exit the SSH session
    echo "Exiting SSH session..."
    exit
EOF
fi

# 10. Deploy the frontend web applications
if [ "$STEP_08_S3_CLOUDFRONT" -eq 1 ]; then
  # 8. Deploy the frontend web applications
  echo "Deploying frontend web application..."
  aws cloudformation deploy \
    --profile $AWS_PROFILE \
    --region $AWS_REGION \
    --template-file dev-ue1-avoca-frontend.yaml \
    --stack-name dev-ue1-avoca-frontend \
    --capabilities CAPABILITY_IAM
    # --parameter-overrides $(cat .env.dev)
fi

if [ "$STEP_09_FRONTEND_SERVICE" -eq 1 ]; then
  # Build the frontend web applications
  WORKING_DIR=../../frontend-service
  BUILD_SCRIPT=build:dev
  LOCAL_DIR=../../frontend-service/dist
  S3_BUCKET="s3://$AWS_ACCOUNT_ID-us-east-1-dev-avoca-web-app"
  DISTRIBUTION_KEY=DevUe1AvocaCloudFrontDistributionId
  DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
    --stack-name dev-ue1-avoca-frontend \
    --query "Stacks[0].Outputs[?OutputKey=='$DISTRIBUTION_KEY'].OutputValue" \
    --output text
  )

  # Build the frontend web applications
  echo "Building frontend web applications..."
  npm --prefix $WORKING_DIR run $BUILD_SCRIPT

  # Sync files from local folder to S3 bucket
  echo "Syncing files from $LOCAL_DIR to $S3_BUCKET..."
  aws s3 sync "$LOCAL_DIR" "$S3_BUCKET"

  # Remove files and folders from S3 bucket that are not present in the local folder
  echo "Deleting files from $S3_BUCKET that are not present in $LOCAL_DIR..."
  aws s3 sync "$LOCAL_DIR" "$S3_BUCKET" --delete

  # Invalidate the CloudFront distribution
  echo "Invalidating CloudFront distribution..."
  if [ -n "$DISTRIBUTION_ID" ]; then
    aws cloudfront create-invalidation \
      --distribution-id $DISTRIBUTION_ID \
      --paths "/*"
  else
    echo "Error: CloudFront Distribution ID not found."
  fi
fi

# All done!
echo "Deployment complete"
