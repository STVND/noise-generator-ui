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
  // Cast to Linter.FlatConfig for type explicitness if its own type is more complex but compatible.
  pluginVue.configs['flat/essential'] as Linter.Config,

  // Recommended TypeScript configurations for Vue from @vue/eslint-config-typescript
  // vueTsConfigs.recommended is already Linter.FlatConfig[]
  ...vueTsConfigs.recommended,

  // Vitest configuration
  {
    name: 'app/vitest-config',
    files: ['src/**/__tests__/*'],
    // Spread Vitest recommended config (which includes plugins, rules, etc.)
    // Cast for type explicitness if its own type is more complex but compatible.
    ...(pluginVitest.configs.recommended as Linter.Config),
  },
];

export default configs;
