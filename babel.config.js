module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // `@/` alias: tsconfig paths only type-check; Metro needs this plugin to resolve them.
    ['module-resolver', { root: ['.'], alias: { '@': './src' } }],
    // zod v4 ships `export * as ns from`, which the RN preset does not transform on its own.
    '@babel/plugin-transform-export-namespace-from',
  ],
};
