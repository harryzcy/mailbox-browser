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

## Environment Variables

- `AWS_ACCESS_KEY_ID`: AWS access key id
- `AWS_SECRET_ACCESS_KEY`: AWS secret access key
- `AWS_REGION`: AWS region code
- `AWS_API_ID`: AWS API Gateway ID
- `AWS_API_GATEWAY_ENDPOINT`: AWS API Gateway endpoint
- `EMAIL_ADDRESSES`: a comma-separated list of email addresses/domains to send email from (required for replying emails)

## Components

| Directory | Description |
| --------- | ----------- |
| bff | Backend for frontend |
| web | Web frontend |
