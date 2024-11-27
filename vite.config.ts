import { defineConfig, loadEnv } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react-swc';
import mkcert from 'vite-plugin-mkcert';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    base: '/newway/',
    plugins: [react(), tsconfigPaths(), mkcert()],
    publicDir: './public',
    server: {
      host: true,
      proxy: {
        '/api/v1': {
          target: env.VITE_API_URL || 'https://api.sexystyle.site',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api\/v1/, '/api')
        }
      }
    },
    define: {
      'process.env': {
        VITE_API_URL: JSON.stringify(env.VITE_API_URL),
        VITE_TONCENTER_API_KEY: JSON.stringify(env.VITE_TONCENTER_API_KEY),
        VITE_TON_CONTRACT_ADDRESS: JSON.stringify(env.VITE_TON_CONTRACT_ADDRESS)
      }
    }
  };
});
