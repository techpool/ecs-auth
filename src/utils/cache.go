package utils

import (
	"time"
	"auth/src/resources"
	"github.com/go-redis/redis"
	"log"
)

var client *redis.Client

func Init() {
	client = resources.Redis
}

func SetCache(key, val string, ttl uint32) error {
	err := client.Set(key, val, time.Duration(ttl)*time.Second).Err()
	if err != nil {
		//panic(err)
		log.Println("Error: While adding to cache")
		return err
	}
	return nil
}

func GetCache(key string) (interface{},error) {
	val, err := client.Get(key).Result()
	if err == redis.Nil {
		log.Println("Error: Key doesn't exists in cache")
		return nil, nil
	} else if err != nil {
		//panic(err)
		log.Println("Error: While adding getting from cache")
		return nil, err
	}
	return val, nil
}

func DeleteCache(key string) error {
	err := client.Del(key).Err()
	if err != nil {
		//panic(err)
		log.Println("Error: While deleting from cache")
		return err
	}
	return nil
}

