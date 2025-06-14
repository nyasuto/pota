package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func main() {
	app := fiber.New()

	// Middleware
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowMethods: "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders: "Origin,Content-Type,Accept,Authorization",
	}))

	// Routes
	setupRoutes(app)

	log.Fatal(app.Listen(":8080"))
}

func setupRoutes(app *fiber.App) {
	api := app.Group("/api/v1")

	// Health check
	api.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status": "ok",
			"message": "Potarin Backend API is running",
		})
	})

	// Course suggestions endpoint
	api.Post("/suggestions", handleSuggestions)

	// Course details endpoint
	api.Post("/details", handleDetails)
}

func handleSuggestions(c *fiber.Ctx) error {
	// TODO: Implement AI-powered course suggestions
	return c.JSON(fiber.Map{
		"message": "Course suggestions endpoint - Coming soon",
	})
}

func handleDetails(c *fiber.Ctx) error {
	// TODO: Implement course details with waypoints
	return c.JSON(fiber.Map{
		"message": "Course details endpoint - Coming soon",
	})
}