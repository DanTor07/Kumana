package com.kumana.models

import kotlinx.serialization.Serializable

@Serializable
data class Investment(
    val id: Long,
    val userId: String,
    val fromCurrency: String,
    val toCurrency: String,
    val fromAmount: Double,
    val toAmount: Double,
    val rate: Double,
    val date: String
)

@Serializable
data class ExchangeRequest(
    val userId: String,
    val fromCurrency: String,
    val toCurrency: String,
    val fromAmount: Double,
    val toAmount: Double,
    val rate: Double
)
