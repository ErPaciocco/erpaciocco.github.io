import vuePlugin from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import RubyPlugin from 'vite-plugin-ruby'
import path from 'path'

export default defineConfig({
  plugins: [
    RubyPlugin(),
    vuePlugin()
  ],
  build: {
    rollupOptions: {
      input: '_frontend/entrypoints/application.js'
    },
    outDir: path.resolve(__dirname, '../assets/js'),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      'vue': 'vue/dist/vue.esm-bundler.js'
    }
  }
})
