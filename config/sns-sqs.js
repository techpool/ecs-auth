var config = {};

config.devo = {
  'REGION' : 'ap-southeast-1',
  'QUEUE' : `https://sqs.ap-southeast-1.amazonaws.com/${process.env.AWS_PROJ_ID}/devo-auth`,
  'POLL_SLEEP_TIME' : 30000,
};

config.gamma = {
  'REGION' : 'ap-southeast-1',
  'QUEUE' : `https://sqs.ap-southeast-1.amazonaws.com/${process.env.AWS_PROJ_ID}/prod-auth`,
  'POLL_SLEEP_TIME' : 30000,
};

config.prod = {
  'REGION' : 'ap-southeast-1',
  'QUEUE' : `https://sqs.ap-southeast-1.amazonaws.com/${process.env.AWS_PROJ_ID}/prod-auth`,
  'POLL_SLEEP_TIME' : 30000,
};

config.local = {
  'REGION' : 'ap-southeast-1',
  'QUEUE' : `https://sqs.ap-southeast-1.amazonaws.com/${process.env.AWS_PROJ_ID}/devo-auth`,
  'POLL_SLEEP_TIME' : 30000,
};

module.exports = config;
