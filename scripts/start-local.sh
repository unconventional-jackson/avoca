CALLS_SERVICE_PORT=8080
API_SERVICE_PORT=4000
DATABASE_SERVICE_PORT=5432
FRONTEND_SERVICE_PORT=5173

# Kill off any processes running on desired ports
echo "Killing any processes on port $API_SERVICE_PORT..."
kill -9 $(lsof -t -i:$API_SERVICE_PORT)

echo "Killing any processes on port $CALLS_SERVICE_PORT..."
kill -9 $(lsof -t -i:$CALLS_SERVICE_PORT)

echo "Killing any processes on port $DATABASE_SERVICE_PORT..."
kill -9 $(lsof -t -i:$DATABASE_SERVICE_PORT)

echo "Killing any processes on port $FRONTEND_SERVICE_PORT..."
kill -9 $(lsof -t -i:$FRONTEND_SERVICE_PORT)

# Make sure that credentials are executable
chmod +x ./scripts/get-credentials.sh

# Get the credentials for the dev environment
source ./scripts/get-credentials.sh uc-dev

# Start the database and migrations via docker-compose
docker-compose -f docker-compose.local.yml up --build &
DOCKER_COMPOSE_SERVICE_PID=$!
sleep 3

# echo "Starting the API..."
# npm --prefix ./api-service install
# npm --prefix ./api-service run start:local &
# API_SERVICE_PID=$!
# sleep 3

echo "Starting the frontend..."
npm --prefix ./frontend-service install
npm --prefix ./frontend-service run start:local &
FRONTEND_SERVICE_PID=$!

# Define a cleanup function to handle resource cleanup before exit
cleanup() {
  echo "Cleaning up..."
  kill $DOCKER_COMPOSE_SERVICE_PID
  # kill $API_SERVICE_PID
  kill $FRONTEND_SERVICE_PID
  echo "Cleanup complete. Exiting."
  exit 0
}

# Trap the SIGINT (Ctrl+C) and SIGTERM signals and call the cleanup function
trap cleanup SIGINT SIGTERM

# Main script logic
echo "Running locally. Press Ctrl+C to exit."

# Simulating a long-running task
while true; do
  sleep 1
  echo "Running locally..."
done

# Ensuring cleanup if the script exits naturally
trap cleanup EXIT