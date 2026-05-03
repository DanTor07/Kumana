package com.kumana.repository

import com.kumana.models.Investment

class InvestmentRepository {

    private val investments = mutableListOf<Investment>()

    fun getByUser(userId: String): List<Investment> =
        investments.filter { it.userId == userId }

    fun save(investment: Investment): Investment {
        investments.add(investment)
        return investment
    }

    fun getAll(): List<Investment> = investments.toList()
}
