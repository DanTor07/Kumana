package com.kumana.repository

import com.kumana.config.FirestoreConfig
import com.kumana.models.Investment

class InvestmentRepository {

    private val col = FirestoreConfig.db.collection("investments")

    fun getByUser(userId: String): List<Investment> {
        val docs = col.whereEqualTo("userId", userId).get().get()
        return docs.documents
            .mapNotNull { doc ->
                val d = doc.data ?: return@mapNotNull null
                Investment(
                    id = d["id"] as? Long ?: System.currentTimeMillis(),
                    userId = d["userId"] as? String ?: "",
                    fromCurrency = d["fromCurrency"] as? String ?: "",
                    toCurrency = d["toCurrency"] as? String ?: "",
                    fromAmount = (d["fromAmount"] as? Double) ?: (d["fromAmount"] as? Long)?.toDouble() ?: 0.0,
                    toAmount = (d["toAmount"] as? Double) ?: (d["toAmount"] as? Long)?.toDouble() ?: 0.0,
                    rate = (d["rate"] as? Double) ?: (d["rate"] as? Long)?.toDouble() ?: 0.0,
                    date = d["date"] as? String ?: ""
                )
            }
            .sortedByDescending { it.date }
    }

    fun save(investment: Investment): Investment {
        val data = mapOf(
            "id" to investment.id,
            "userId" to investment.userId,
            "fromCurrency" to investment.fromCurrency,
            "toCurrency" to investment.toCurrency,
            "fromAmount" to investment.fromAmount,
            "toAmount" to investment.toAmount,
            "rate" to investment.rate,
            "date" to investment.date
        )
        col.add(data).get()
        return investment
    }
}
