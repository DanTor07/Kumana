package com.kumana.services

import com.kumana.models.WalletResponse
import com.kumana.repository.WalletRepository

class WalletService {

    private val repo = WalletRepository()

    fun getBalance(userId: String): Map<String, Double> =
        repo.getBalance(userId)

    fun deposit(userId: String, currency: String, amount: Double): WalletResponse {
        val balance = repo.deposit(userId, currency, amount)
        return WalletResponse(success = true, balance = balance)
    }
}
