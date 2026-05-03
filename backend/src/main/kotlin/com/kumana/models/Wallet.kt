package com.kumana.models

import kotlinx.serialization.Serializable

@Serializable
data class DepositRequest(
    val userId: String,
    val currency: String,
    val amount: Double
)

@Serializable
data class WalletResponse(
    val success: Boolean,
    val balance: Map<String, Double>
)
