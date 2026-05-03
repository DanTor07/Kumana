package com.kumana.services

import com.kumana.models.HistoricalRate
import com.kumana.models.RateResponse
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.serialization.json.*
import kotlinx.serialization.json.Json

class RatesService {

    private val client = HttpClient(CIO) {
        install(ContentNegotiation) {
            json(Json { ignoreUnknownKeys = true })
        }
    }

    suspend fun getLatestRates(): RateResponse {
        return try {
            val response: JsonObject = client.get("https://open.er-api.com/v6/latest/USD").body()
            val rates = response["rates"]?.jsonObject
                ?.mapValues { it.value.jsonPrimitive.double }
                ?: emptyMap()
            RateResponse(rates = rates)
        } catch (e: Exception) {
            RateResponse(rates = emptyMap())
        }
    }

    suspend fun getHistoricalRates(from: String, to: String, startDate: String): List<HistoricalRate> {
        return try {
            val today = java.time.LocalDate.now().toString()
            val url = "https://api.frankfurter.app/$startDate..$today?from=$from&to=$to"
            val response: JsonObject = client.get(url).body()
            val rates = response["rates"]?.jsonObject ?: return emptyList()

            rates.entries
                .sortedBy { it.key }
                .mapNotNull { (date, rateObj) ->
                    val value = rateObj.jsonObject[to]?.jsonPrimitive?.doubleOrNull
                    value?.let { HistoricalRate(date = date, value = it) }
                }
        } catch (e: Exception) {
            emptyList()
        }
    }
}
