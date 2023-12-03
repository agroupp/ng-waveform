// .eslintrc.js

module.exports = {
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended'
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module'
    },
    plugins: [
      '@typescript-eslint'
    ],
    env: {
      browser: true,
      node: true
    },
    rules: {
      // Fügen Sie Ihre spezifischen ESLint-Regeln hier hinzu
      "@typescript-eslint/no-explicit-any": "off"
    }
  };
  