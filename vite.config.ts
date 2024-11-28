import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react-swc';
import mkcert from 'vite-plugin-mkcert';

export default defineConfig({
  base: '/newway/',
  plugins: [react(), tsconfigPaths(), mkcert()],
  publicDir: './public',
  server: {
    host: true,
    proxy: {
      '/api': {
        target: 'https://api.sexystyle.site',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
