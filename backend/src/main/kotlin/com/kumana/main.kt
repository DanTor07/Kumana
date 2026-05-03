package com.kumana

import com.kumana.config.configureSerialization
import com.kumana.routes.configureAuthRoutes
import com.kumana.routes.configureInvestmentRoutes
import com.kumana.routes.configureRatesRoutes
import com.kumana.routes.configureWalletRoutes
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.callloging.*
import io.ktor.server.plugins.cors.routing.*
import org.slf4j.event.Level

fun main() {
    embeddedServer(
        Netty,
        port = 8080,
        host = "0.0.0.0"
    ) {
        module()
    }.start(wait = true)
}

fun Application.module() {
    install(CallLogging) {
        level = Level.INFO
    }

    install(CORS) {
        anyHost()
        allowMethod(HttpMethod.Get)
        allowMethod(HttpMethod.Post)
        allowMethod(HttpMethod.Put)
        allowMethod(HttpMethod.Delete)
        allowHeader(HttpHeaders.ContentType)
    }

    configureSerialization()
    configureAuthRoutes()
    configureRatesRoutes()
    configureWalletRoutes()
    configureInvestmentRoutes()
}
