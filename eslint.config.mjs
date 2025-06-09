import antfu from '@antfu/eslint-config'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  antfu({
    markdown: false,
    rules: {
      'style/comma-dangle': ['warn', 'never'],
      'vue/comma-dangle': 'off',
      'antfu/top-level-function': 'off',
      'style/brace-style': 'off',
      'eqeqeq': 'off',
      'vue/eqeqeq': 'off',
      'no-console': 'off',
      'vue/max-attributes-per-line': 'warn',
      'vue/no-unused-refs': 'off',
      'no-debugger': 'off',
      'no-async-promise-executor': 'off',
      'node/prefer-global/process': 'off'
    }
  }),
  {
    settings: {
      'import/resolver': {
        alias: {
          map: [
            ['~', './'],
            ['~~', './']
          ],
          extensions: ['.js', '.ts', '.vue']
        },
        node: {
          extensions: ['.js', '.ts', '.vue']
        },
        typescript: {}
      }
    }
  }
)
