package com.kumana.controllers

import com.kumana.models.WalletResponse
import com.kumana.services.WalletService

class WalletController {

    private val service = WalletService()

    fun getBalance(userId: String): Map<String, Double> =
        service.getBalance(userId)

    fun deposit(userId: String, currency: String, amount: Double): WalletResponse =
        service.deposit(userId, currency, amount)
}
