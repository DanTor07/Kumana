package com.kumana.routes

import com.kumana.controllers.InvestmentController
import com.kumana.models.ExchangeRequest
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Application.configureInvestmentRoutes() {

    val controller = InvestmentController()

    routing {
        route("/investments") {

            get("/{userId}") {
                val userId = call.parameters["userId"]
                if (userId == null) {
                    call.respond(HttpStatusCode.BadRequest, mapOf("error" to "userId requerido"))
                    return@get
                }
                val investments = controller.getByUser(userId)
                call.respond(investments)
            }

            post("/exchange") {
                val body = call.receive<ExchangeRequest>()
                val investment = controller.exchange(body)
                call.respond(investment)
            }
        }
    }
}
