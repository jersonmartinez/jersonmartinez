import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://www.jersonmartinez.com',
  output: 'static',
  build: { format: 'directory' }
});
