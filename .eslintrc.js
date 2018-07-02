module.exports = {
  root: true,
  env: {
    browser: true,
    es6: true,
    node: true
  },
  extends: 'airbnb',
  'parser': 'babel-eslint',
  rules: { 
    'no-console': 0,
    // windows linebreaks when not in production environment
    'linebreak-style': [
      'error', process.env.NODE_ENV === 'prod' ? 'unix' : 'windows'
    ]
  }
}
