package utils

import (
	"time"
	"auth/src/resources"
	"github.com/go-redis/redis"
)

var client *redis.Client

func Init() {
	client = resources.Redis
}

func SetCache(key, val string, ttl uint32) error {
	err := client.Set(key, val, time.Duration(ttl)*time.Second).Err()
	if err != nil {
		panic(err)
		return err
	}
	return nil
}

func GetCache(key string) (interface{},error) {
	val, err := client.Get(key).Result()
	if err == redis.Nil {
		return nil, nil
	} else if err != nil {
		panic(err)
		return nil, err
	}
	return val, nil
}

func DeleteCache(key string) error {
	err := client.Del(key).Err()
	if err != nil {
		panic(err)
		return err
	}
	return nil
}

