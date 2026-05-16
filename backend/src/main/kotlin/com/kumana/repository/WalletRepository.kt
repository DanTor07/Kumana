package com.kumana.repository

import com.kumana.config.FirestoreConfig

class WalletRepository {

    private val col = FirestoreConfig.db.collection("wallets")

    fun getBalance(userId: String): Map<String, Double> {
        val doc = col.document(userId).get().get()
        if (!doc.exists()) return emptyMap()
        return doc.data?.mapValues { (_, v) ->
            when (v) {
                is Double -> v
                is Long -> v.toDouble()
                is Number -> v.toDouble()
                else -> 0.0
            }
        } ?: emptyMap()
    }

    fun deposit(userId: String, currency: String, amount: Double): Map<String, Double> {
        val current = getBalance(userId).toMutableMap()
        current[currency] = (current[currency] ?: 0.0) + amount
        col.document(userId).set(current as Map<String, Any>).get()
        return current
    }

    fun withdraw(userId: String, currency: String, amount: Double): Boolean {
        val current = getBalance(userId).toMutableMap()
        val available = current[currency] ?: 0.0
        if (available < amount) return false
        current[currency] = available - amount
        col.document(userId).set(current as Map<String, Any>).get()
        return true
    }

    fun forceWithdraw(userId: String, currency: String, amount: Double) {
        val current = getBalance(userId).toMutableMap()
        current[currency] = (current[currency] ?: 0.0) - amount
        col.document(userId).set(current as Map<String, Any>).get()
    }

    fun credit(userId: String, currency: String, amount: Double) {
        val current = getBalance(userId).toMutableMap()
        current[currency] = (current[currency] ?: 0.0) + amount
        col.document(userId).set(current as Map<String, Any>).get()
    }
}
