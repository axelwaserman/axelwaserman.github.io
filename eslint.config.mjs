import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'

const config = [
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '.claude/**',
      '.planning/**',
      'public/**',
      'e2e/screenshots/**',
    ],
  },
  ...nextCoreWebVitals,
]

export default config
