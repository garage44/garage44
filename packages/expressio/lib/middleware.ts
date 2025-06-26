import {logger, runtime} from '../service.ts'
import apiConfig from '../api/config.ts'
import apiI18n from '../api/i18n.ts'
import apiProfile from '../api/profile.ts'
import apiWorkspaces from '../api/workspaces'
import {commonMiddleware} from '@garage44/common/lib/middleware'
import {config} from '../lib/config.ts'
import path from 'node:path'

// Simple HTTP router for Bun.serve that mimics Express pattern
class Router {
    routes: { method: string, path: RegExp, handler: (req: Request, params: Record<string, string>) => Promise<Response> }[] = [];

    get(path: string, handler: (req: Request, params: Record<string, string>) => Promise<Response>) {
        this.add('GET', path, handler);
    }

    post(path: string, handler: (req: Request, params: Record<string, string>) => Promise<Response>) {
        this.add('POST', path, handler);
    }

    put(path: string, handler: (req: Request, params: Record<string, string>) => Promise<Response>) {
        this.add('PUT', path, handler);
    }

    delete(path: string, handler: (req: Request, params: Record<string, string>) => Promise<Response>) {
        this.add('DELETE', path, handler);
    }

    private add(method: string, path: string, handler: (req: Request, params: Record<string, string>) => Promise<Response>) {
        // Convert path params (e.g. /api/workspaces/:id) to regex
        const regex = new RegExp('^' + path.replace(/:[^/]+/g, '([^/]+)') + '$');
        this.routes.push({ method, path: regex, handler });
    }

    async route(req: Request): Promise<Response | null> {
        const url = new URL(req.url);
        const pathname = url.pathname;
        for (const { method, path, handler } of this.routes) {
            if (req.method === method && path.test(pathname)) {
                // Extract params
                const paramValues = pathname.match(path)?.slice(1) || [];
                const params: Record<string, string> = {};
                paramValues.forEach((val, idx) => {
                    params[`param${idx}`] = val;
                });
                return await handler(req, params);
            }
        }
        return null;
    }
}

export async function initMiddleware(bunchyConfig) {
    const { handleRequest, handleWebSocket } = await commonMiddleware(logger, config, bunchyConfig)
    const router = new Router();

    // Register HTTP API endpoints using familiar Express-like pattern
    await apiI18n(router);
    await apiConfig(router);
    await apiProfile(router);
    await apiWorkspaces(router);

    const publicPath = path.join(runtime.service_dir, 'public')

    // Add static file serving and SPA fallback to the request handler
    const finalHandleRequest = async (request: Request, server?: any): Promise<Response | undefined> => {
        const url = new URL(request.url)
        console.log('[FETCH]', url.pathname)

        // Handle WebSocket upgrade requests
        if (url.pathname === '/ws' || url.pathname === '/bunchy') {
            console.log(`[FETCH] ${url.pathname} hit, attempting Bun WebSocket upgrade`);
            if (server && typeof server.upgrade === 'function') {
                const success = server.upgrade(request, { data: { endpoint: url.pathname } });
                if (success) return;
                return new Response("WebSocket upgrade failed", { status: 400 });
            }
            return new Response("WebSocket server not available", { status: 500 });
        }

        // Serve static files from public directory
        if (url.pathname.startsWith('/public/')) {
            const filePath = path.join(publicPath, url.pathname.replace('/public', ''))
            try {
                const file = Bun.file(filePath)
                if (await file.exists()) {
                    console.log('[FETCH] Serving static file', filePath)
                    return new Response(file)
                }
            } catch (error) {
                // File doesn't exist, continue to next handler
                console.log('[FETCH] Static file not found', filePath)
            }
        }

        // Try the router for HTTP API endpoints
        const apiResponse = await router.route(request);
        if (apiResponse) {
            console.log('[FETCH] API route matched', url.pathname)
            return apiResponse;
        }

        // Try the enhanced request handler (for WebSocket API, etc.)
        try {
            const response = await handleRequest(request)
            if (response) {
                console.log('[FETCH] Enhanced handler matched', url.pathname)
                return response
            }
        } catch (error) {
            // Handler didn't match or failed, continue to SPA fallback
            console.log('[FETCH] Enhanced handler error', error)
        }

        // SPA fallback - serve index.html for all other routes
        try {
            const indexFile = Bun.file(path.join(publicPath, 'index.html'))
            if (await indexFile.exists()) {
                console.log('[FETCH] SPA fallback for', url.pathname)
                return new Response(indexFile, {
                    headers: { 'Content-Type': 'text/html' }
                })
            }
        } catch (error) {
            // index.html doesn't exist
            console.log('[FETCH] SPA fallback index.html not found')
        }

        // Final fallback - 404
        console.log('[FETCH] 404 for', url.pathname)
        return new Response('Not Found', { status: 404 })
    }

    return {
        handleRequest: finalHandleRequest,
        handleWebSocket
    }
}
