package resources

import (
	"github.com/go-redis/redis"

	"auth/src/config"
	"log"
)

var (
	Redis *redis.Client
)

func Init() error {

	log.Println("Initialising redis")
	Redis = redis.NewClient(&redis.Options{
		Addr: config.Redis.Host,
		DB: config.Redis.DB,
	});


	_, err := Redis.Ping().Result()
	if err != nil {
		return err
	}

	return nil
}

func Terminate() {
	if Redis != nil {
		Redis.Close()
	}
}

