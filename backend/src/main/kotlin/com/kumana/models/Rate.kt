package com.kumana.models

import kotlinx.serialization.Serializable

@Serializable
data class RateResponse(
    val rates: Map<String, Double>
)

@Serializable
data class HistoricalRate(
    val date: String,
    val value: Double
)
