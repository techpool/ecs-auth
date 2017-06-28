var config = {};

config.devo = {
  'PORT': 80,
  'SERVICE': 'ecs-auth-devo',
  'REDIS_HOST_IP': 'ecs-auth.e6ocw5.0001.apse1.cache.amazonaws.com',
  'REDIS_HOST_PORT': '8080',
  'REDIS_KIND':'AUTH'
};

config.gamma = {
  'PORT': 80,
  'SERVICE': 'ecs-auth-gamma',
  'REDIS_HOST_IP': 'ecs-auth.cpzshl.ng.0001.apse1.cache.amazonaws.com',
  'REDIS_HOST_PORT': '8080',
  'REDIS_KIND':'AUTH'
};


config.prod = {
  'PORT': 80,
  'SERVICE': 'ecs-auth-prod',
  'REDIS_HOST_IP': 'ecs-auth.cpzshl.ng.0001.apse1.cache.amazonaws.com',
  'REDIS_HOST_PORT': '8080',
  'REDIS_KIND':'AUTH'
};

module.exports = config;
