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
	// Load .env file if it exists (development)
	if err := godotenv.Load(); err != nil {
		log.Printf("No .env file found: %v", err)
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