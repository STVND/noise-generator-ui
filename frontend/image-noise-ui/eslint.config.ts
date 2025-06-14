import { vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import pluginVitest from '@vitest/eslint-plugin'
import type { Linter } from 'eslint' // Import the base Linter type

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

// ESLint Flat Config: an array of config objects.
// See https://eslint.org/docs/latest/use/configure/configuration-files-new
const configs: Linter.Config[] = [
  {
    name: 'app/project-files-glob',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },
  {
    name: 'app/global-ignores',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**'],
  },

  // Base Vue configuration
  pluginVue.configs['flat/essential'] as Linter.Config,


  // Vitest configuration
  {
    name: 'app/vitest-config',
    files: ['src/**/__tests__/*'],
    ...(pluginVitest.configs.recommended as Linter.Config),
  },
];

export default configs;
