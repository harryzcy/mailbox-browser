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

Two forms of authentication is supported when using Cloudflare for deployments:

- Basic Auth: Providing `AUTH_BASIC_USER` and `AUTH_BASIC_PASS` environmental variable will enabled HTTP basic auth for all routes.
- Forward Auth: This method delegates authentication to an external service, whose URL address is defined by `AUTH_FORWARD_ADDRESS`.

  For every request received, the middleware will send a request with the same header to the external service. If the response has a 2XX code, then the access is granted and the original request is performed. Otherwise, the response from the external service is returned.

  Forward Auth will take precedence over basic auth. So if `AUTH_FORWARD_ADDRESS` is defined, Basic Auth won't be performed.

## Environment Variables

During runtime:

- `EMAIL_ADDRESSES`: a comma-separated list of email addresses/domains to send email from (required for replying emails)
- `PROXY_ENABLE` (optional): whether to proxy email images, must be `true` or `false` (default)
- `AUTH_BASIC_USER`: Basic Auth username (only available using Cloudflare Pages)
- `AUTH_BASIC_PASS`: Basic Auth password (only available using Cloudflare Pages)
- `AUTH_FORWARD_ADDRESS`: Forward Auth address (only available using Cloudflare Pages)

During deployment:

- `AWS_ACCESS_KEY_ID`: AWS access key id
- `AWS_SECRET_ACCESS_KEY`: AWS secret access key
- `AWS_REGION`: AWS region code
- `AWS_API_ID`: AWS API Gateway ID
- `AWS_API_GATEWAY_ENDPOINT`: AWS API Gateway endpoint
- `CF_PROJECT_NAME`: The project name for Cloudflare Pages deployment. When this is set, `wrangler` won't prompt to select project every time.

## Components

| Directory | Description |
| --------- | ----------- |
| bff | Backend for frontend |
| cloudflare | Cloudflare Pages deployment |
| web | Web frontend |

## Screenshots

| Dark mode |  Light mode |
|:---------:|:-----------:|
| ![Screenshot Dark Mode](https://github.com/harryzcy/mailbox-browser/assets/37034805/b77a6c40-c6c1-4dd8-98de-2add697b26f9) | ![Screenshot Light Mode](https://github.com/harryzcy/mailbox-browser/assets/37034805/ce9ab42c-923a-4b03-8ee4-bcdc9d4b72ed) |
