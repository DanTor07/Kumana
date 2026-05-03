package com.kumana.routes

import com.kumana.controllers.AuthController
import com.kumana.models.ProfileRequest
import com.kumana.models.RegisterRequest
import com.kumana.models.VerifyRequest
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Application.configureAuthRoutes() {

    val controller = AuthController()

    routing {
        route("/auth") {

            post("/register") {
                val body = call.receive<RegisterRequest>()
                val response = controller.register(body.phone, body.countryCode)
                call.respond(response)
            }

            post("/verify") {
                val body = call.receive<VerifyRequest>()
                val response = controller.verify(body.phone, body.code)
                if (response.success) {
                    call.respond(response)
                } else {
                    call.respond(HttpStatusCode.Unauthorized, response)
                }
            }

            post("/profile") {
                val body = call.receive<ProfileRequest>()
                val user = controller.saveProfile(body)
                if (user != null) {
                    call.respond(user)
                } else {
                    call.respond(HttpStatusCode.NotFound, "Usuario no encontrado")
                }
            }
        }
    }
}
