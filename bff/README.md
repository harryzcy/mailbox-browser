# Backend for Frontend

This backend layer proxies [core mailbox](https://github.com/harryzcy/mailbox) APIs and handles relevant authentications required by AWS API Gateway.

## Environment variables

- `MODE`: dev (default) or prod
- `LOG_PATH`: path to the log file
- `STATIC_DIR`: path to frontend build file directory
- `MAILBOX_URL`: url of mailbox service hosted on AWS
