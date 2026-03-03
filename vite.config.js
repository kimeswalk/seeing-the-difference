import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    {
      name: 'api-dev-server',
      configureServer(server) {
        server.middlewares.use('/api/generate', async (req, res) => {
          let body = '';
          req.on('data', chunk => body += chunk);
          req.on('end', async () => {
            const upstream = await fetch('https://api.anthropic.com/v1/messages', {
              method: 'POST',
              headers: {
                'content-type': 'application/json',
                'x-api-key': process.env.ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01',
              },
              body,
            });
            const data = await upstream.json();
            res.setHeader('content-type', 'application/json');
            res.statusCode = upstream.status;
            res.end(JSON.stringify(data));
          });
        });
      },
    },
  ],
})
