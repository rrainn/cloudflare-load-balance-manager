# cloudflare-load-balance-manager [![Known Vulnerabilities](https://snyk.io/test/github/rrainn/cloudflare-load-balance-manager/badge.svg)](https://snyk.io/test/github/rrainn/cloudflare-load-balance-manager) [![Dependencies](https://david-dm.org/rrainn/cloudflare-load-balance-manager.svg)](https://david-dm.org/rrainn/cloudflare-load-balance-manager) [![Dev Dependencies](https://david-dm.org/rrainn/cloudflare-load-balance-manager/dev-status.svg)](https://david-dm.org/rrainn/cloudflare-load-balance-manager?type=dev) [![NPM version](https://badge.fury.io/js/cloudflare-load-balance-manager.svg)](http://badge.fury.io/js/cloudflare-load-balance-manager)

cloudflare-load-balance-manager is an easy to use CLI tool that lets you easily register and deregister instances with a Cloudflare load balancer. This is useful during deployments to stop traffic to your instance then resuming traffic after your deployment is complete.

## Install

```
npm install -g cloudflare-load-balance-manager
```

## Usage

```
cloudflare-load-balance-manager <command> <options>
```

**Commands:**

- `register` (Register instance to Cloudflare)
- `deregister` (Deregister instance to Cloudflare)

**Example command:**

```
cloudflare-load-balance-manager register --email test@test.com --api-key abcdefghijlmnopqrstuvwxyzabcde --name lb1
```

```
cloudflare-load-balance-manager deregister --email test@test.com --api-key abcdefghijlmnopqrstuvwxyzabcde --name lb2
```

**Help command:**

```
cloudflare-load-balance-manager --help
```

```
cloudflare-load-balance-manager -h
```
