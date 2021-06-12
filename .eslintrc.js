module.exports = {
  root: true,
  //  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json'
  },
  plugins: ['@typescript-eslint'],
  extends: ['standard-with-typescript'],
  rules: {
    '@typescript-eslint/triple-slash-reference': 'off',
    '@typescript-eslint/semi': ['error', 'always'],
    semi: ['error', 'always']
  }
};
