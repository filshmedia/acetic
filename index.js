module.exports = process.env.ACETIC_COV
  ? require('./lib-cov/acetic')
  : require('./lib/acetic');
