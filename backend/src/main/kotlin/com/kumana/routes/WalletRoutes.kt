package com.kumana.routes

import com.kumana.controllers.WalletController
import com.kumana.models.DepositRequest
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Application.configureWalletRoutes() {

    val controller = WalletController()

    routing {
        route("/wallet") {

            get("/{userId}") {
                val userId = call.parameters["userId"]
                if (userId == null) {
                    call.respond(HttpStatusCode.BadRequest, mapOf("error" to "userId requerido"))
                    return@get
                }
                val balance = controller.getBalance(userId)
                call.respond(balance)
            }

            post("/deposit") {
                val body = call.receive<DepositRequest>()
                val response = controller.deposit(body.userId, body.currency, body.amount)
                call.respond(response)
            }
        }
    }
}
