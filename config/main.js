var config = {};

config.devo = {
  'PORT': 80,
  'SERVICE': 'devo-auth-aws',
  'REDIS_HOST_IP': 'ecs-auth.e6ocw5.0001.apse1.cache.amazonaws.com',
  'REDIS_HOST_PORT': '8080',
  'REDIS_KIND':'PAGE'
};

config.prod = {
  'PORT': 80,
  'SERVICE': 'prod-auth-aws'
};

module.exports = config;