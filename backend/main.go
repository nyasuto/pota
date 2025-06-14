package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"potarin-backend/config"
	"potarin-backend/handlers"
	"potarin-backend/services"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Initialize services
	openaiService := services.NewOpenAIService(cfg.OpenAIAPIKey)

	// Initialize handlers
	courseHandler := handlers.NewCourseHandler(openaiService)

	app := fiber.New()

	// Middleware
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowMethods: "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders: "Origin,Content-Type,Accept,Authorization",
	}))

	// Routes
	setupRoutes(app, courseHandler)

	log.Printf("Server starting on port %s", cfg.Port)
	log.Fatal(app.Listen(":" + cfg.Port))
}

func setupRoutes(app *fiber.App, courseHandler *handlers.CourseHandler) {
	api := app.Group("/api/v1")

	// Health check
	api.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "ok",
			"message": "Potarin Backend API is running",
		})
	})

	// Course suggestions endpoint
	api.Post("/suggestions", courseHandler.GetSuggestions)

	// Course details endpoint
	api.Post("/details", courseHandler.GetDetails)
}
