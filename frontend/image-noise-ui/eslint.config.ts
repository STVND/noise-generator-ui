import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import pluginVitest from '@vitest/eslint-plugin'

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
  {
    name: 'app/project-files-glob',
    files: ['**/*.{ts,mts,tsx,vue}'],

  },
  {
    name: 'app/global-ignores',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**'],
  },

  // Base Vue and TypeScript configurations
  pluginVue.configs['flat/essential'],
  ...vueTsConfigs.recommended,


  {
    name: 'app/vitest-config',
    ...pluginVitest.configs.recommended,
    files: ['src/**/__tests__/*'],
  },
)
