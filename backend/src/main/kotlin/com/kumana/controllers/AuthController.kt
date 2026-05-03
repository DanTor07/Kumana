package com.kumana.controllers

import com.kumana.models.AuthResponse
import com.kumana.models.ProfileRequest
import com.kumana.models.User
import com.kumana.services.AuthService

class AuthController {

    private val service = AuthService()

    fun register(phone: String, countryCode: String): AuthResponse =
        service.register(phone, countryCode)

    fun verify(phone: String, code: String): AuthResponse =
        service.verify(phone, code)

    fun saveProfile(request: ProfileRequest): User? =
        service.saveProfile(request)
}
