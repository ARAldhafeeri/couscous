const { defineConfig } = require('@vscode/test-cli');

module.exports = defineConfig({
  files: 'dist/test/suite/**/*.test.js', 
  version: 'stable',
  mocha: {
    ui: 'tdd',
    timeout: 20000,
  }
});