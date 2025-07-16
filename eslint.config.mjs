import antfu from '@antfu/eslint-config'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  antfu({
    markdown: false,
    rules: {
      'style/comma-dangle': ['warn', 'never'],
      'style/brace-style': 'off',
      'style/operator-linebreak': 'off',
      'vue/comma-dangle': 'off',
      'vue/eqeqeq': 'off',
      'vue/max-attributes-per-line': 'warn',
      'vue/no-unused-refs': 'off',
      'antfu/top-level-function': 'off',
      'node/prefer-global/process': 'off',
      'eqeqeq': 'off',
      'no-console': 'off',
      'no-debugger': 'off',
      'no-async-promise-executor': 'off'
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
