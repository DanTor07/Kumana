package com.kumana.controllers

import com.kumana.models.ExchangeRequest
import com.kumana.models.Investment
import com.kumana.services.InvestmentService

class InvestmentController {

    private val service = InvestmentService()

    fun getByUser(userId: String): List<Investment> =
        service.getByUser(userId)

    fun exchange(request: ExchangeRequest): Investment? =
        service.exchange(request)
}
