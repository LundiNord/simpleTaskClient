# simpleTaskClient
[![Better Stack Badge](https://uptime.betterstack.com/status-badges/v2/monitor/1vdy2.svg)](https://status.leonbruns.de) [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=LundiNord_simpleTaskClient&metric=alert_status&token=31f216a9b65639f3cf2f7028ceeb20f419b07b6f)](https://sonarcloud.io/summary/new_code?id=LundiNord_simpleTaskClient)

View and edit tasks: [tasks.nyxnord.de](https://tasks.nyxnord.de/).

Uses [Simple Task Client Backend](https://gitlab.com/lundi_nord/simple_task_backend) as a backend server to proxy requests to a CalDAV server.

## Build
```bash
npm install --include=dev
npx rollup -c
```

## Features
- view and edit tasks from a CalDAV server.
- view and edit local tasks saved in browser storage.
- edit name and done status.

## Planned Features
- better mobile ui.

## Used Libraries
- [Simple Task Client Backend](https://gitlab.com/lundi_nord/simple_task_backend) [![Better Stack Badge](https://uptime.betterstack.com/status-badges/v2/monitor/1ve9h.svg)](https://status.leonbruns.de)
- Self-hosted [Umami](https://github.com/umami-software/umami) [![Better Stack Badge](https://uptime.betterstack.com/status-badges/v2/monitor/1ti8l.svg)](https://status.leonbruns.de) for tracking page views.
