package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	AppMode     string // "cloud" or "local"
	Port        string
	DatabaseURL string // for Postgres
	DBPath      string // for SQLite
}

func Load() *Config {
	_ = godotenv.Load() // Loads .env if it exists

	mode := os.Getenv("APP_MODE")
	if mode == "" {
		mode = "local"
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	dbPath := os.Getenv("DB_PATH")
	if dbPath == "" {
		dbPath = "inventorex.db"
	}

	return &Config{
		AppMode:     mode,
		Port:        port,
		DatabaseURL: os.Getenv("DATABASE_URL"),
		DBPath:      dbPath,
	}
}
