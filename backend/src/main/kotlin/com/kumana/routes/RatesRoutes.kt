package com.kumana.routes

import com.kumana.controllers.RatesController
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Application.configureRatesRoutes() {

    val controller = RatesController()

    routing {
        route("/rates") {

            get("/latest") {
                val response = controller.getLatest()
                call.respond(response)
            }

            get("/historical") {
                val from = call.request.queryParameters["from"]
                val to = call.request.queryParameters["to"]
                val startDate = call.request.queryParameters["startDate"]

                if (from == null || to == null || startDate == null) {
                    call.respond(
                        HttpStatusCode.BadRequest,
                        mapOf("error" to "Se requieren los parámetros: from, to, startDate")
                    )
                    return@get
                }

                val response = controller.getHistorical(from, to, startDate)
                call.respond(response)
            }
        }
    }
}
