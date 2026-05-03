package com.kumana.services

import com.kumana.models.ExchangeRequest
import com.kumana.models.Investment
import com.kumana.repository.InvestmentRepository
import com.kumana.repository.WalletRepository

class InvestmentService {

    private val investmentRepo = InvestmentRepository()
    private val walletRepo = WalletRepository()

    fun getByUser(userId: String): List<Investment> =
        investmentRepo.getByUser(userId)

    fun exchange(request: ExchangeRequest): Investment? {
        val withdrawn = walletRepo.withdraw(request.userId, request.fromCurrency, request.fromAmount)
        if (!withdrawn) return null

        walletRepo.credit(request.userId, request.toCurrency, request.toAmount)

        val investment = Investment(
            id = System.currentTimeMillis(),
            userId = request.userId,
            fromCurrency = request.fromCurrency,
            toCurrency = request.toCurrency,
            fromAmount = request.fromAmount,
            toAmount = request.toAmount,
            rate = request.rate,
            date = java.time.Instant.now().toString()
        )
        return investmentRepo.save(investment)
    }
}
