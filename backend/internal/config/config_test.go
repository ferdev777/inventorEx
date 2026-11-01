package config_test

import (
	"os"
	"testing"

	"github.com/inventorex/backend/internal/config"
)

func TestConfigDefaults(t *testing.T) {
	os.Unsetenv("APP_MODE")
	os.Unsetenv("PORT")
	os.Unsetenv("DB_PATH")
	os.Unsetenv("DATABASE_URL")

	cfg := config.Load()

	if cfg.AppMode != "local" {
		t.Errorf("expected AppMode to be 'local', got '%s'", cfg.AppMode)
	}
	if cfg.Port != "8080" {
		t.Errorf("expected Port to be '8080', got '%s'", cfg.Port)
	}
	if cfg.DBPath != "inventorex.db" {
		t.Errorf("expected DBPath to be 'inventorex.db', got '%s'", cfg.DBPath)
	}
}

