export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'refactor',
        'chore',
        'docs',
        'style',
        'test',
        'perf',
        'ci',
        'build',
        'revert',
      ],
    ],
    'body-max-line-length': [2, 'always', 1000],
  },
}
