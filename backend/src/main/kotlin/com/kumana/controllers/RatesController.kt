package com.kumana.controllers

import com.kumana.models.HistoricalRate
import com.kumana.models.RateResponse
import com.kumana.services.RatesService

class RatesController {

    private val service = RatesService()

    suspend fun getLatest(): RateResponse = service.getLatestRates()

    suspend fun getHistorical(from: String, to: String, startDate: String): List<HistoricalRate> =
        service.getHistoricalRates(from, to, startDate)
}
