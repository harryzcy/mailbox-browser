# mailbox-browser

Web Interface for Mailbox.

## Usage

### Docker

```shell
docker run --env AWS_ACCESS_KEY_ID=<AWS_ACCESS_KEY_ID> \
           --env AWS_SECRET_ACCESS_KEY=<AWS_SECRET_ACCESS_KEY> \
           --env AWS_REGION=<AWS_REGION> \
           ---env AWS_API_ID=<AWS_API_ID> \
           --env AWS_API_GATEWAY_ENDPOINT=<AWS_API_GATEWAY_ENDPOINT> \
           harryzcy/mailbox-browser
```

### Cloudflare Pages & Pages Functions

1. Clone the repository
1. Create [Cloudflare project](https://developers.cloudflare.com/pages/get-started/guide/)
1. Configure correct environment variables according to [this](#environment-variables) section
1. Run `make cloudflare`

Replace the environment variables with respective values.

## Environment Variables

- `AWS_ACCESS_KEY_ID`: AWS access key id
- `AWS_SECRET_ACCESS_KEY`: AWS secret access key
- `AWS_REGION`: AWS region code
- `AWS_API_ID`: AWS API Gateway ID
- `AWS_API_GATEWAY_ENDPOINT`: AWS API Gateway endpoint
- `EMAIL_ADDRESSES`: a comma-separated list of email addresses/domains to send email from (required for replying emails)
- `PROXY_ENABLE` (optional): whether to proxy email images, must be `true` or `false` (default)

## Components

| Directory | Description |
| --------- | ----------- |
| bff | Backend for frontend |
| cloudflare | Cloudflare Pages deployment |
| web | Web frontend |
