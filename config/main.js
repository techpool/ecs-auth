var config = {};

config.development = {
  'ACCESS_TOKEN_DATASTORE_PROJECT': 'devo-pratilipi',
  'API_ORCHESTRATOR_PORT': 80,
  'LOGGING_PROJECT': 'devo-pratilipi',
  'METRIC_PROJECT': 'devo-pratilipi',
};

config.production = {
  'ACCESS_TOKEN_DATASTORE_PROJECT': 'prod-pratilipi',
  'API_ORCHESTRATOR_PORT': 80,
  'LOGGING_PROJECT': 'pratilipi-157909',
  'METRIC_PROJECT': 'pratilipi-157909',
};

module.exports = config;