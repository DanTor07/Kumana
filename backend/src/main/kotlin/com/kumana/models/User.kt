package com.kumana.models

import kotlinx.serialization.Serializable

@Serializable
data class User(
    val id: String,
    val phone: String,
    val countryCode: String,
    val name: String = "",
    val username: String = "",
    val email: String = "",
    val idType: String = "CC",
    val cedula: String = "",
    val memberSince: String = ""
)

@Serializable
data class RegisterRequest(
    val phone: String,
    val countryCode: String
)

@Serializable
data class VerifyRequest(
    val phone: String,
    val code: String
)

@Serializable
data class ProfileRequest(
    val userId: String,
    val name: String,
    val username: String,
    val email: String,
    val idType: String = "CC",
    val cedula: String
)

@Serializable
data class AuthResponse(
    val success: Boolean,
    val userId: String = "",
    val phoneVerified: Boolean = false,
    val message: String = ""
)
