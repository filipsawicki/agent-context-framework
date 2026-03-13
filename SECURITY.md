# Security Policy

## Reporting A Vulnerability
If you discover a security issue, please avoid opening a public issue with exploit details.

Instead, share:
- a clear description of the issue
- the affected files or workflow
- reproduction steps if applicable
- the potential impact

Use GitHub private vulnerability reporting if it is enabled for the repository. If it is not enabled, use the maintainer's private contact channel instead of a public issue.

## Scope
This project is primarily a workflow and tooling starter. Security-relevant issues may include:
- unsafe defaults in scripts
- hardcoded secrets or machine-specific paths
- unsafe documentation that encourages insecure setup
- dependency issues in shipped tooling

## Current Safety Assumptions
- canonical project state should stay in `context/*`
- local runtime config in `config/project.env` is treated as untrusted input and should not be executed as shell code
- helper scripts prefer repo-local tooling over machine-specific paths
- generated local config files such as `config/project.env` should not be committed
