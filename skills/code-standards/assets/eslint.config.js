export default [
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    rules: {
      'max-lines': ['error', { max: 120, skipBlankLines: false, skipComments: false }],
      'max-lines-per-function': ['error', { max: 30, skipBlankLines: false, skipComments: true }],
      'max-depth': ['error', 2],
      'max-params': ['error', 3],
      'no-magic-numbers': ['warn', { ignore: [0, 1, -1], ignoreArrayIndexes: true, enforceConst: true }],
      'no-else-return': ['error', { allowElseIf: false }],
      'no-var': 'error',
      'prefer-const': 'error',
      eqeqeq: ['error', 'always'],
      'no-nested-ternary': 'error',
    },
  },
];
