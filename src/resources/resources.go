package resources

import (
	"github.com/go-redis/redis"

	"log"
	"os"
	"fmt"
	"strconv"
)

var (
	Redis *redis.Client
)

func Init() error {

	redisHost := fmt.Sprintf("%s:%s",os.Getenv("MASTER_REDIS_ENDPOINT"),os.Getenv("MASTER_REDIS_PORT"))

	redisDB, err := strconv.Atoi(os.Getenv("MASTER_REDIS_DB"))
	if err != nil {
		return err
	}

	log.Println("Initialising redis")
	//log.Println(redisHost, redisDB)

	Redis = redis.NewClient(&redis.Options{
		Addr: redisHost,
		DB: redisDB,
	});

	_, err = Redis.Ping().Result()
	if err != nil {
		log.Println(err)
		return err
	}

	return nil
}

func Terminate() {
	if Redis != nil {
		Redis.Close()
	}
}

