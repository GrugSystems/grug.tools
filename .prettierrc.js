/** @type {import("prettier").Config} */
export default {
  plugins: [
    'prettier-plugin-tailwindcss',
    '@trivago/prettier-plugin-sort-imports',
  ],
  trailingComma: 'all',
  tabWidth: 2,
  semi: true,
  singleQuote: true,
  importOrder: ['<THIRD_PARTY_MODULES>', '^@/(.*)$', '^[./]'],
  tailwindFunctions: ['cn'],
};
