import { defineConfig } from 'vite';

const hostConfig = {
  host: '0.0.0.0',
  allowedHosts: true,
};

export default defineConfig({
  server: hostConfig,
  preview: hostConfig,
});
