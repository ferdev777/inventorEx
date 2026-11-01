package db

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/inventorex/backend/internal/config"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/stdlib"
	_ "modernc.org/sqlite" // SQLite driver
)

func Init(cfg *config.Config) (*sql.DB, error) {
	if cfg.AppMode == "cloud" {
		if cfg.DatabaseURL == "" {
			return nil, fmt.Errorf("DATABASE_URL is required when APP_MODE is 'cloud'")
		}

		fmt.Println("Connecting to Cloud database (PostgreSQL via Supabase Transaction Pooler)...")
		connConfig, err := pgx.ParseConfig(cfg.DatabaseURL)
		if err != nil {
			return nil, fmt.Errorf("failed to parse DATABASE_URL: %w", err)
		}

		// Disable prepared statements for Supabase Transaction Pooler (PgBouncer)
		connConfig.DefaultQueryExecMode = pgx.QueryExecModeSimpleProtocol

		db := stdlib.OpenDB(*connConfig)

		// Set connection pool limits suitable for transaction pooler
		db.SetMaxOpenConns(10)
		db.SetMaxIdleConns(5)
		db.SetConnMaxLifetime(time.Hour)

		if err := db.Ping(); err != nil {
			db.Close()
			return nil, fmt.Errorf("failed to ping cloud database: %w", err)
		}

		fmt.Println("Successfully connected to Cloud database.")
		return db, nil
	}

	fmt.Printf("Connecting to Local database (SQLite at %s)...\n", cfg.DBPath)
	db, err := sql.Open("sqlite", cfg.DBPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open sqlite database: %w", err)
	}

	// SQLite single-writer optimization
	db.SetMaxOpenConns(1)

	if err := db.Ping(); err != nil {
		db.Close()
		return nil, fmt.Errorf("failed to ping local database: %w", err)
	}

	fmt.Println("Successfully connected to Local database.")
	return db, nil
}
