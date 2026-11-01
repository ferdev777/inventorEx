package db_test

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/inventorex/backend/internal/config"
	"github.com/inventorex/backend/internal/db"
)

func TestInitLocal(t *testing.T) {
	tempDir := t.TempDir()
	dbPath := filepath.Join(tempDir, "test.db")

	cfg := &config.Config{
		AppMode: "local",
		DBPath:  dbPath,
	}

	database, err := db.Init(cfg)
	if err != nil {
		t.Fatalf("expected successful local db init, got error: %v", err)
	}
	defer database.Close()

	if _, err := os.Stat(dbPath); os.IsNotExist(err) {
		t.Errorf("expected sqlite database file to exist at %s", dbPath)
	}
}

func TestInitCloudMissingURL(t *testing.T) {
	cfg := &config.Config{
		AppMode:     "cloud",
		DatabaseURL: "",
	}

	_, err := db.Init(cfg)
	if err == nil {
		t.Fatal("expected error when DATABASE_URL is empty in cloud mode, got nil")
	}
}

