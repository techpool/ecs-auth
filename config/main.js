var config = {};

config.devo = {
  'PORT': 80,
  'REDIS_HOST_IP': 'devo-ecs.e6ocw5.0001.apse1.cache.amazonaws.com',
  'REDIS_HOST_PORT': '8080',
  'REDIS_KIND':'AUTH',
  'GCP_PROJ_ID' : process.env.GCP_PROJ_ID
};

config.gamma = {
  'PORT': 80,
  'REDIS_HOST_IP': 'prod-ecs.cpzshl.ng.0001.apse1.cache.amazonaws.com',
  'REDIS_HOST_PORT': '8080',
  'REDIS_KIND':'AUTH',
  'GCP_PROJ_ID' : process.env.GCP_PROJ_ID
};


config.prod = {
  'PORT': 80,
  'REDIS_HOST_IP': 'prod-ecs.cpzshl.ng.0001.apse1.cache.amazonaws.com',
  'REDIS_HOST_PORT': '8080',
  'REDIS_KIND':'AUTH',
  'GCP_PROJ_ID' : process.env.GCP_PROJ_ID
};

config.local = {
  'PORT' : 8080,
  'REDIS_HOST_IP': '127.0.0.1',
  'REDIS_HOST_PORT': '6379',
  'REDIS_KIND':'AUTH',
  'GCP_PROJ_ID' : 'devo-pratilipi'
};

module.exports = config;
