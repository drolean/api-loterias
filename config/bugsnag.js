const bugsnag = require('bugsnag');

bugsnag.register(process.env.BUGSNAG, {
  autoNotify: true,
  releaseStage: process.env.NODE_ENV,
  notifyReleaseStages: ['stage', 'production'],
});

module.exports = bugsnag;
