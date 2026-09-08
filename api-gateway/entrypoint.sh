#!/bin/sh
set -e

# Default fallbacks if ENV variables are missing
export TASK_SERVICE_HOST="${TASK_SERVICE_HOST:-task-service}"
export TASK_SERVICE_PORT="${TASK_SERVICE_PORT:-5001}"
export USER_SERVICE_HOST="${USER_SERVICE_HOST:-user-service}"
export USER_SERVICE_PORT="${USER_SERVICE_PORT:-5002}"

echo "Configuring API Gateway reverse proxy targets:"
echo " -> Task Service: ${TASK_SERVICE_HOST}:${TASK_SERVICE_PORT}"
echo " -> User Service: ${USER_SERVICE_HOST}:${USER_SERVICE_PORT}"

# Perform envsubst for Nginx template
envsubst '${TASK_SERVICE_HOST} ${TASK_SERVICE_PORT} ${USER_SERVICE_HOST} ${USER_SERVICE_PORT}' \
  < /etc/nginx/nginx.conf.template \
  > /etc/nginx/nginx.conf

# Start Nginx in foreground
exec nginx -g "daemon off;"
