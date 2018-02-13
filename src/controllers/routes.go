package controllers

import (
	"github.com/labstack/echo"

	"auth/src/controllers/v1"
)

func Init (app *echo.Echo) {

	app.GET("/auth/test", v1.Test)
	app.GET("/auth/isAuthorized", v1.Validate)
}


