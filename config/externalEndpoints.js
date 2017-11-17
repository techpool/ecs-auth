var config = {};

config.SOCIAL_ENDPOINT = `${process.env.API_END_POINT}/social`;
config.USER_ENDPOINT = `${process.env.API_END_POINT}/users`;
config.AUTHOR_ENDPOINT = `${process.env.API_END_POINT}/authors`;


config.PARAMETER_STORE_MYSQL_USERNAME = '/ecs/follow/mysql/username';
config.PARAMETER_STORE_MYSQL_PASSWORD = '/ecs/follow/mysql/password';

module.exports = config;
