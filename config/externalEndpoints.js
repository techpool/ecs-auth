var config = {};

config.SOCIAL_ENDPOINT = `${process.env.API_END_POINT}/social`;


config.PARAMETER_STORE_MYSQL_USERNAME = '/ecs/follow/mysql/username';
config.PARAMETER_STORE_MYSQL_PASSWORD = '/ecs/follow/mysql/password';

module.exports = config;
