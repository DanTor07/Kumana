package com.kumana.repository

class WalletRepository {

    // userId -> { currency -> amount }
    private val wallets = mutableMapOf<String, MutableMap<String, Double>>()

    fun getBalance(userId: String): Map<String, Double> =
        wallets[userId]?.toMap() ?: emptyMap()

    fun deposit(userId: String, currency: String, amount: Double): Map<String, Double> {
        val wallet = wallets.getOrPut(userId) { mutableMapOf() }
        wallet[currency] = (wallet[currency] ?: 0.0) + amount
        return wallet.toMap()
    }

    fun withdraw(userId: String, currency: String, amount: Double): Boolean {
        val wallet = wallets[userId] ?: return false
        val current = wallet[currency] ?: 0.0
        if (current < amount) return false
        wallet[currency] = current - amount
        return true
    }

    fun credit(userId: String, currency: String, amount: Double) {
        val wallet = wallets.getOrPut(userId) { mutableMapOf() }
        wallet[currency] = (wallet[currency] ?: 0.0) + amount
    }
}
