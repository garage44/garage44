/**
 * Generate systemd service files for PR deployments
 */

interface ServiceConfig {
    name: string
    port: number
    workingDir: string
    env?: Record<string, string>
}

const BASE_SERVICES: ServiceConfig[] = [
    {
        name: 'expressio',
        port: 3030,
        workingDir: '/home/garage44/garage44/packages/expressio',
    },
    {
        name: 'pyrite',
        port: 3031,
        workingDir: '/home/garage44/garage44/packages/pyrite',
    },
]

const PR_BASE_PORT = 4000

/**
 * Generate systemd service file for a PR deployment
 */
export function generatePRService(serviceName: string, prNumber: number, basePort: number, workingDir: string, env?: Record<string, string>): string {
    const portOffset = prNumber % 1000
    const port = basePort + portOffset
    
    const envVars = env ? Object.entries(env).map(([key, value]) => `Environment="${key}=${value}"`).join('\n') : ''
    
    return `[Unit]
Description=${serviceName} PR #${prNumber} preview service
After=network.target

[Service]
Type=simple
User=garage44
Group=garage44
WorkingDirectory=${workingDir}
Environment="NODE_ENV=production"
Environment="BUN_ENV=production"
Environment="PATH=/home/garage44/.bun/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
${envVars}
ExecStart=/home/garage44/.bun/bin/bun run server -- --port ${port}
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
`
}

/**
 * Generate all PR service files for a given PR number
 */
export function generatePRServices(prNumber: number): Array<{serviceName: string; content: string; port: number}> {
    const portOffset = prNumber % 1000
    const services: Array<{serviceName: string; content: string; port: number}> = []
    
    for (const service of BASE_SERVICES) {
        const port = PR_BASE_PORT + portOffset + (BASE_SERVICES.indexOf(service) * 10)
        const serviceName = `${service.name}-pr-${prNumber}`
        const content = generatePRService(serviceName, prNumber, service.port, service.workingDir)
        services.push({serviceName, content, port})
    }
    
    return services
}

/**
 * Generate nginx configuration snippet for PR preview
 */
export function generatePRNginxConfig(prNumber: number, domain: string, services: Array<{serviceName: string; port: number}>): string {
    const portOffset = prNumber % 1000
    let config = `# PR #${prNumber} preview configuration\n`
    config += `server {\n`
    config += `    listen 443 ssl;\n`
    config += `    http2 on;\n`
    config += `    server_name pr-${prNumber}.${domain};\n\n`
    config += `    # SSL certificates (Let's Encrypt)\n`
    config += `    ssl_certificate /etc/letsencrypt/live/${domain}/fullchain.pem;\n`
    config += `    ssl_certificate_key /etc/letsencrypt/live/${domain}/privkey.pem;\n\n`
    config += `    # SSL configuration\n`
    config += `    ssl_protocols TLSv1.2 TLSv1.3;\n`
    config += `    ssl_ciphers HIGH:!aNULL:!MD5;\n`
    config += `    ssl_prefer_server_ciphers on;\n`
    config += `    ssl_session_cache shared:SSL:10m;\n`
    config += `    ssl_session_timeout 10m;\n\n`
    
    // Add location blocks for each service
    for (const service of services) {
        const serviceName = service.serviceName.split('-')[0] // Extract base name (expressio, pyrite)
        config += `    # ${serviceName} service\n`
        config += `    location /${serviceName}/ {\n`
        config += `        proxy_pass http://localhost:${service.port}/;\n`
        config += `        proxy_http_version 1.1;\n`
        config += `        proxy_set_header Host $host;\n`
        config += `        proxy_set_header X-Real-IP $remote_addr;\n`
        config += `        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n`
        config += `        proxy_set_header X-Forwarded-Proto $scheme;\n`
        config += `    }\n\n`
    }
    
    // Default location (first service)
    if (services.length > 0) {
        config += `    location / {\n`
        config += `        proxy_pass http://localhost:${services[0].port};\n`
        config += `        proxy_http_version 1.1;\n`
        config += `        proxy_set_header Host $host;\n`
        config += `        proxy_set_header X-Real-IP $remote_addr;\n`
        config += `        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n`
        config += `        proxy_set_header X-Forwarded-Proto $scheme;\n`
        config += `    }\n`
    }
    
    config += `}\n\n`
    
    return config
}
