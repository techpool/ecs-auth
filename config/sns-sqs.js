var config = {};

config.devo = {
  'REGION' : 'ap-southeast-1',
  'QUEUE' : `https://sqs.ap-southeast-1.amazonaws.com/${process.env.AWS_PROJ_ID}/devo-auth`,
};

config.gamma = {
  'REGION' : 'ap-southeast-1',
  'QUEUE' : `https://sqs.ap-southeast-1.amazonaws.com/${process.env.AWS_PROJ_ID}/prod-auth`,
};

config.prod = {
  'REGION' : 'ap-southeast-1',
  'QUEUE' : `https://sqs.ap-southeast-1.amazonaws.com/${process.env.AWS_PROJ_ID}/prod-auth`,
};

config.local = {
  'REGION' : 'ap-southeast-1',
  'QUEUE' : `https://sqs.ap-southeast-1.amazonaws.com/${process.env.AWS_PROJ_ID}/devo-auth`,
};

module.exports = config;
