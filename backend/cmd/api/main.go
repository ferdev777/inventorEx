package main

import (
	"fmt"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/inventorex/backend/internal/config"
	"github.com/inventorex/backend/internal/db"
)

func main() {
	cfg := config.Load()

	// 1. Inicializar la BD correcta según el modo
	database, err := db.Init(cfg)
	if err != nil {
		fmt.Printf("Error conectando a la base de datos: %v\n", err)
		os.Exit(1)
	}
	defer database.Close()

	// 2. Configurar router (Chi)
	r := chi.NewRouter()

	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173", "http://localhost:5174", "http://localhost:5180", "http://localhost:5181"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
	}))

	// 3. Rutas base
	r.Get("/api/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(fmt.Sprintf(`{"status":"online", "mode":"%s"}`, cfg.AppMode)))
	})

	// 4. Arrancar Servidor
	fmt.Printf("Servidor corriendo en el puerto :%s [Modo: %s]\n", cfg.Port, cfg.AppMode)
	http.ListenAndServe(":"+cfg.Port, r)
}
