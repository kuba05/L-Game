module.exports = {
    root: true,
    parserOptions: {
        project: 'tsconfig.json'
    },
    plugins: ['@typescript-eslint'],
    extends: ['standard-with-typescript'],
    rules: {
        eqeqeq: ['error', 'always'],
        indent: ['error', 4],
        '@typescript-eslint/indent': ['error', 4],
        '@typescript-eslint/triple-slash-reference': 'off',
        semi: ['error', 'always'],
        '@typescript-eslint/semi': ['error', 'always']
    }
};
