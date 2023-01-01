# mailbox-browser

Web Interface for Mailbox.

## Usage via Docker

```shell
docker run --env AWS_ACCESS_KEY_ID=<AWS_ACCESS_KEY_ID> \
           --env AWS_SECRET_ACCESS_KEY=<AWS_SECRET_ACCESS_KEY> \
           --env AWS_REGION=<AWS_REGION> \
           ---env AWS_API_ID=<AWS_API_ID> \
           --env AWS_API_GATEWAY_ENDPOINT=<AWS_API_GATEWAY_ENDPOINT> \
           harryzcy/mailbox-browser
```

Replace the environment variables with respective values.

## Components

| Directory | Description |
| --------- | ----------- |
| bff | Backend for frontend |
| web | Web frontend |
