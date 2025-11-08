# VPS Deployment Guide

This guide covers setting up automatic deployment from GitHub to a private VPS using webhooks.

## Architecture

- **Webhook Server**: Standalone Bun script that validates GitHub webhooks and triggers deployment
- **Deployment**: Pulls code, removes databases, builds packages, and restarts systemd services
- **GitHub Actions**: Workflow that calls the webhook endpoint on merge to main
- **Systemd**: Services for each package (expressio, pyrite, styleguide) running `bun run dev`
- **Nginx**: Reverse proxy configuration for subdomains and webhook endpoint

## Prerequisites

- VPS running Linux (Ubuntu/Debian recommended)
- Bun installed on the VPS
- Nginx installed and configured
- Git repository cloned to `/home/garage44/garage44`
- Dedicated user `garage44` created on the VPS
- Sudo access for the `garage44` user to restart systemd services

## VPS Setup

### 1. Create Dedicated User

```bash
sudo useradd -m -s /bin/bash garage44
sudo usermod -aG sudo garage44
```

### 2. Clone Repository

```bash
sudo -u garage44 git clone <repository-url> /home/garage44/garage44
cd /home/garage44/garage44
sudo -u garage44 bun install
```

### 3. Install Bun (if not already installed)

```bash
curl -fsSL https://bun.sh/install | bash
```

### 4. Set Up Environment Variables

Create `/home/garage44/.env` or add to `/home/garage44/.bashrc`:

```bash
export WEBHOOK_SECRET="your-secret-here"
export WEBHOOK_PORT=3001
export REPO_PATH="/home/garage44/garage44"
export DEPLOY_USER="garage44"
```

Generate a secure webhook secret:

```bash
openssl rand -hex 32
```

## Systemd Services

### 1. Install Service Files

Copy the service files to systemd directory:

```bash
sudo cp deploy/expressio.service /etc/systemd/system/
sudo cp deploy/pyrite.service /etc/systemd/system/
sudo cp deploy/styleguide.service /etc/systemd/system/
```

### 2. Reload Systemd

```bash
sudo systemctl daemon-reload
```

### 3. Enable and Start Services

```bash
sudo systemctl enable expressio.service
sudo systemctl enable pyrite.service
sudo systemctl enable styleguide.service

sudo systemctl start expressio.service
sudo systemctl start pyrite.service
sudo systemctl start styleguide.service
```

### 4. Check Service Status

```bash
sudo systemctl status expressio.service
sudo systemctl status pyrite.service
sudo systemctl status styleguide.service
```

### 5. View Logs

```bash
sudo journalctl -u expressio.service -f
sudo journalctl -u pyrite.service -f
sudo journalctl -u styleguide.service -f
```

## Webhook Server

### 1. Create Systemd Service for Webhook Server

Create `/etc/systemd/system/webhook.service`:

```ini
[Unit]
Description=GitHub Webhook Server
After=network.target

[Service]
Type=simple
User=garage44
Group=garage44
WorkingDirectory=/home/garage44/garage44
Environment="WEBHOOK_SECRET=your-secret-here"
Environment="WEBHOOK_PORT=3001"
Environment="REPO_PATH=/home/garage44/garage44"
Environment="DEPLOY_USER=garage44"
ExecStart=bun lib/webhook-server.ts
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

### 2. Enable and Start Webhook Server

```bash
sudo systemctl daemon-reload
sudo systemctl enable webhook.service
sudo systemctl start webhook.service
sudo systemctl status webhook.service
```

## Nginx Configuration

### 1. Install Nginx

```bash
sudo apt update
sudo apt install nginx
```

### 2. Configure Nginx

Copy the example configuration:

```bash
sudo cp deploy/nginx.conf.example /etc/nginx/sites-available/garage44
sudo ln -s /etc/nginx/sites-available/garage44 /etc/nginx/sites-enabled/
```

Edit the configuration to match your domain names:

```bash
sudo nano /etc/nginx/sites-available/garage44
```

### 3. Test and Reload Nginx

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 4. Optional: Restrict Webhook Endpoint by IP

To restrict the webhook endpoint to GitHub Actions IP ranges, uncomment the IP restrictions in the nginx configuration:

```nginx
location /webhook {
    allow 140.82.112.0/20;
    allow 143.55.64.0/20;
    allow 185.199.108.0/22;
    allow 192.30.252.0/22;
    deny all;
    # ... rest of configuration
}
```

Note: GitHub Actions IP ranges can change. Consider using a more flexible approach or monitoring GitHub's IP ranges.

## GitHub Secrets Configuration

### 1. Add Secrets to GitHub Repository

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Add the following secrets:

- **WEBHOOK_URL**: The full URL to your webhook endpoint (e.g., `http://garage44.org/webhook` or `https://garage44.org/webhook`)
- **WEBHOOK_SECRET**: The same secret you set in the VPS environment variables

### 2. Verify Secrets

The GitHub Actions workflow (`.github/workflows/deploy.yml`) will use these secrets to call the webhook endpoint.

## Sudo Configuration

The deployment script needs to restart systemd services, which requires sudo access. Configure passwordless sudo for the `garage44` user:

```bash
sudo visudo
```

Add this line:

```
garage44 ALL=(ALL) NOPASSWD: /bin/systemctl restart expressio.service, /bin/systemctl restart pyrite.service, /bin/systemctl restart styleguide.service
```

## Testing the Deployment

### 1. Test Webhook Server Locally

```bash
cd /home/garage44/garage44
WEBHOOK_SECRET="your-secret-here" bun lib/webhook-server.ts
```

In another terminal, test the webhook:

```bash
curl -X POST http://localhost:3001 \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: push" \
  -H "X-Hub-Signature-256: sha256=$(echo -n '{"ref":"refs/heads/main"}' | openssl dgst -sha256 -hmac "your-secret-here" -binary | xxd -p -c 256)" \
  -d '{"ref":"refs/heads/main"}'
```

### 2. Test GitHub Actions Workflow

1. Make a change to the repository
2. Merge to the `main` branch
3. Check GitHub Actions to see if the workflow runs
4. Check the webhook server logs: `sudo journalctl -u webhook.service -f`
5. Check service logs to verify deployment

### 3. Verify Services

```bash
# Check if services are running
sudo systemctl status expressio.service
sudo systemctl status pyrite.service
sudo systemctl status styleguide.service

# Check if services are accessible
curl http://localhost:3030  # Expressio
curl http://localhost:3031  # Pyrite
curl http://localhost:8080  # Styleguide
```

## Troubleshooting

### Webhook Server Not Starting

1. Check logs: `sudo journalctl -u webhook.service -f`
2. Verify environment variables are set correctly
3. Verify the webhook secret matches between GitHub and VPS

### Deployment Failing

1. Check webhook server logs: `sudo journalctl -u webhook.service -f`
2. Verify git repository is accessible
3. Verify sudo permissions for service restart
4. Check build logs in the deployment output

### Services Not Restarting

1. Verify sudo configuration allows service restart
2. Check service status: `sudo systemctl status expressio.service`
3. Check service logs: `sudo journalctl -u expressio.service -f`

### Nginx Not Proxying

1. Check nginx configuration: `sudo nginx -t`
2. Check nginx error logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify services are listening on the correct ports

## Security Considerations

1. **Webhook Secret**: Use a strong, randomly generated secret
2. **IP Restrictions**: Consider restricting webhook endpoint to GitHub Actions IP ranges
3. **HTTPS**: Use HTTPS for the webhook endpoint in production
4. **User Permissions**: Run services as a dedicated user with minimal permissions
5. **Sudo Access**: Limit sudo access to only necessary commands

## Maintenance

### Updating Services

Services will automatically restart when code is deployed via the webhook. To manually restart:

```bash
sudo systemctl restart expressio.service
sudo systemctl restart pyrite.service
sudo systemctl restart styleguide.service
```

### Updating Webhook Server

The webhook server code is part of the repository, so it will be updated automatically when code is deployed. Restart the webhook service after deployment:

```bash
sudo systemctl restart webhook.service
```

### Database Cleanup

The deployment script automatically removes database files (`~/.pyrite.db`, `~/.expressio.db`) before building. This ensures a clean state between deployments.

## Port Configuration

Default ports for services:

- **Expressio**: 3030
- **Pyrite**: 3031
- **Styleguide**: 8080
- **Webhook Server**: 3001

These can be changed in the systemd service files and nginx configuration.
