const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()
const apiOrigin = process.env.NEXT_PUBLIC_API_URL || 'https://api.edu-sipikat.com'
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  `connect-src 'self' ${apiOrigin} https://api.edu-sipikat.com`,
  "img-src 'self' data: https: http:",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "upgrade-insecure-requests",
].join('; ')

const securityHeaders = {
  'Content-Security-Policy': contentSecurityPolicy,
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
}

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      res.removeHeader('X-Powered-By')

      for (const [header, value] of Object.entries(securityHeaders)) {
        res.setHeader(header, value)
      }

      const forwardedProto = req.headers['x-forwarded-proto']
      const isHttps = req.socket.encrypted || forwardedProto === 'https'
      if (!dev && isHttps) {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
      }

      // Parse URL
      const parsedUrl = parse(req.url, true)
      
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private')
      res.setHeader('Content-Type', 'text/plain; charset=utf-8')
      res.end('Internal server error')
    }
  })
    .listen(port, (err) => {
      if (err) throw err
      console.log(`> Ready on http://${hostname}:${port}`)
    })
})
