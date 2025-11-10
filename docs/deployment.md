# VPS Deployment Guide

This guide covers setting up automatic deployment from GitHub to a private VPS using webhooks.

## Architecture

- **Webhook Server**: Standalone Bun script that validates GitHub webhooks and triggers deployment
- **Deployment**: Pulls code, removes databases, builds packages, and restarts systemd services
- **GitHub Actions**: Workflow that calls the webhook endpoint on merge to main
- **Systemd**: Services for each package (expressio, pyrite, malkovich) running `bun run dev`
- **Nginx**: Reverse proxy configuration for subdomains and webhook endpoint

## Prerequisites

- VPS running Linux (Arch Linux)
- Bun installed on the VPS
- Nginx installed and configured
- Git repository cloned to `/home/garage44/garage44`
- Dedicated user `garage44` created on the VPS
- Sudo access for the `garage44` user to restart systemd services

## VPS Setup

### 1. Create Dedicated User

```bash
sudo useradd -m -s /bin/bash garage44
sudo usermod -aG wheel garage44
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

## Galène Installation

Galène is the SFU (Selective Forwarding Unit) required by Pyrite for video conferencing.

### 1. Install Go (if not already installed)

```bash
# Arch Linux
sudo pacman -S go

# Or download from https://go.dev/dl/
```

### 2. Build Galène

```bash
# Clone Galène repository
cd /home/garage44
git clone https://github.com/jech/galene.git
cd galene

# Build Galène binary
CGO_ENABLED=0 go build -ldflags='-s -w'

# For different architecture (e.g., ARM64):
# CGO_ENABLED=0 GOOS=linux GOARCH=arm64 go build -ldflags='-s -w'
```

### 3. Set Up Directories

```bash
cd /home/garage44/galene
mkdir -p groups data recordings
```

### 4. Configure for Nginx SSL Termination

Galène is configured to run with the `-insecure` flag since SSL/TLS termination is handled by nginx. The systemd service file already includes this flag.

### 5. Install Systemd Service

```bash
sudo cp deploy/galene.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable galene.service
sudo systemctl start galene.service
```

### 6. Configure Pyrite to Use Galène

Update your `~/.pyriterc` file to point to Galène:

```json
{
  "sfu": {
    "path": "/home/garage44/galene",
    "url": "http://localhost:8443"
  }
}
```

Note: Galène runs with the `-insecure` flag on `http://localhost:8443` since SSL/TLS termination is handled by nginx. The external URL will be `https://your-domain.com` through nginx.

### 7. Check Galène Status

```bash
sudo systemctl status galene.service
sudo journalctl -u galene.service -f
```

Galène should be accessible at `http://localhost:8443` (or the port you configured). It runs with the `-insecure` flag since SSL/TLS termination is handled by nginx.

### 8. Firewall Configuration

Galène requires the following ports to be open:

- **TCP 8443**: HTTP/HTTPS (or your configured port)
- **TCP/UDP 1194**: TURN server (or your configured port)
- **UDP ports**: Media transfer (ephemeral ports, or restricted range)

For better performance, you can restrict UDP ports using the `-udp-range` option in the systemd service file.

## Systemd Services

### 1. Install Service Files

Copy the service files to systemd directory:

```bash
sudo cp deploy/expressio.service /etc/systemd/system/
sudo cp deploy/pyrite.service /etc/systemd/system/
sudo cp deploy/malkovich.service /etc/systemd/system/
sudo cp deploy/galene.service /etc/systemd/system/
sudo cp deploy/webhook.service /etc/systemd/system/
```

### 2. Reload Systemd

```bash
sudo systemctl daemon-reload
```

### 3. Enable and Start Services

```bash
sudo systemctl enable expressio.service
sudo systemctl enable pyrite.service
sudo systemctl enable malkovich.service
sudo systemctl enable galene.service
sudo systemctl enable webhook.service

sudo systemctl start expressio.service
sudo systemctl start pyrite.service
sudo systemctl start malkovich.service
sudo systemctl start galene.service
sudo systemctl start webhook.service
```

### 4. Check Service Status

```bash
sudo systemctl status expressio.service
sudo systemctl status pyrite.service
sudo systemctl status styleguide.service
sudo systemctl status galene.service
sudo systemctl status webhook.service
```

### 5. View Logs

```bash
sudo journalctl -u expressio.service -f
sudo journalctl -u pyrite.service -f
sudo journalctl -u malkovich.service -f
sudo journalctl -u galene.service -f
sudo journalctl -u webhook.service -f
```

## Webhook Server

### 1. Install Systemd Service for Webhook Server

The webhook service file is included in the repository. Copy it to systemd:

```bash
sudo cp deploy/webhook.service /etc/systemd/system/
```

**Important**: Before starting the service, edit the service file to set your webhook secret:

```bash
sudo nano /etc/systemd/system/webhook.service
```

Update the `WEBHOOK_SECRET` environment variable with your actual secret.

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
sudo pacman -S nginx
```

### 2. Install Certbot

```bash
sudo pacman -S certbot certbot-nginx
```

### 3. Obtain SSL Certificates

**Important**: SSL certificates must be generated before configuring nginx with SSL. The nginx configuration requires certificates to exist, otherwise nginx will fail to start.

Obtain SSL certificates for each domain using standalone mode:

```bash
# Stop nginx temporarily (if running)
sudo systemctl stop nginx

# For expressio.garage44.org
sudo certbot certonly --standalone -d expressio.garage44.org

# For pyrite.garage44.org
sudo certbot certonly --standalone -d pyrite.garage44.org

# For garage44.org (malkovich main domain)
sudo certbot certonly --standalone -d garage44.org

# For garage44.org (and www.garage44.org)
sudo certbot certonly --standalone -d garage44.org -d www.garage44.org
```

Note: Certbot will need to verify domain ownership. Make sure your DNS records point to your VPS and port 80 is accessible before running certbot.

After generating certificates, verify they exist:

```bash
ls -la /etc/letsencrypt/live/expressio.garage44.org/
ls -la /etc/letsencrypt/live/pyrite.garage44.org/
ls -la /etc/letsencrypt/live/garage44.org/
ls -la /etc/letsencrypt/live/garage44.org/
```

You should see `fullchain.pem` and `privkey.pem` files in each directory.

### 4. Configure Nginx

Copy the example configuration:

```bash
sudo cp deploy/nginx.conf.example /etc/nginx/sites-available/garage44.org
sudo ln -s /etc/nginx/sites-available/garage44.org /etc/nginx/sites-enabled/
```

Edit the configuration to match your domain names:

```bash
sudo nano /etc/nginx/sites-available/garage44.org
```

### 5. Test and Reload Nginx

**Important**: Make sure all SSL certificates have been generated before testing nginx configuration. If certificates are missing, nginx will fail to start.

```bash
# Test configuration
sudo nginx -t

# If test passes, reload nginx
sudo systemctl reload nginx

# If nginx is not running, start it
sudo systemctl start nginx
```

### 6. Set Up Automatic Certificate Renewal

Certbot certificates expire every 90 days. Set up automatic renewal:

```bash
# Test renewal
sudo certbot renew --dry-run

# Certbot automatically sets up a systemd timer for renewal
# Check timer status
systemctl status certbot.timer
```

The timer will automatically renew certificates before they expire.

### 7. Optional: Restrict Webhook Endpoint by IP

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

- **WEBHOOK_URL**: The full URL to your webhook endpoint (e.g., `https://garage44.org/webhook`)
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
garage44 ALL=(ALL) NOPASSWD: /bin/systemctl restart expressio.service, /bin/systemctl restart pyrite.service, /bin/systemctl restart malkovich.service
```

## Testing the Deployment

### 1. Test Webhook Server Locally

```bash

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
curl http://localhost:3032  # Malkovich
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
sudo systemctl restart malkovich.service
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
- **Malkovich**: 3032
- **Webhook Server**: 3001

These can be changed in the systemd service files and nginx configuration.
