import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  input: {
    main: resolve(import.meta.dirname, 'index.html'),
    map: resolve(import.meta.dirname, 'map.html'),
    menu: resolve(import.meta.dirname, 'menu.html'),
    ong_menu: resolve(import.meta.dirname, 'ong-menu.html'),
    point_create: resolve(import.meta.dirname, 'point-create.html'),
    user_report: resolve(import.meta.dirname, 'user-report.html'),
    user_settings: resolve(import.meta.dirname, 'user-settings.html'),
    user_suggest: resolve(import.meta.dirname, 'user-suggest.html'),
  },
})