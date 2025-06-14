package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	OpenAIAPIKey string
	Port         string
	Environment  string
}

func Load() *Config {
	// Try to load .env.local first, then .env as fallback
	if err := godotenv.Load(".env.local"); err != nil {
		if err := godotenv.Load(".env"); err != nil {
			log.Printf("No .env.local or .env file found: %v", err)
		} else {
			log.Printf("Loaded .env file")
		}
	} else {
		log.Printf("Loaded .env.local file")
	}

	config := &Config{
		OpenAIAPIKey: getEnv("OPENAI_API_KEY", ""),
		Port:         getEnv("PORT", "8080"),
		Environment:  getEnv("NODE_ENV", "development"),
	}

	// Validate required environment variables
	if config.OpenAIAPIKey == "" {
		log.Fatal("OPENAI_API_KEY environment variable is required")
	}

	return config
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
