package com.kumana.services

import com.kumana.models.AuthResponse
import com.kumana.models.ProfileRequest
import com.kumana.models.User
import com.kumana.repository.UserRepository
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.util.UUID

class AuthService {

    private val repo = UserRepository()
    // En un sistema real, esto sería un mapa temporal con expiración
    private val pendingVerifications = mutableMapOf<String, String>()

    fun register(phone: String, countryCode: String): AuthResponse {
        val existing = repo.findByPhone(phone)
        if (existing != null) {
            return AuthResponse(success = true, userId = existing.id, message = "Usuario existente")
        }

        val userId = UUID.randomUUID().toString()
        val user = User(id = userId, phone = phone, countryCode = countryCode)
        repo.save(user)

        // Código mock de verificación
        pendingVerifications[phone] = "123456"

        return AuthResponse(success = true, userId = userId, message = "Código enviado")
    }

    fun verify(phone: String, code: String): AuthResponse {
        val expected = pendingVerifications[phone]
        val user = repo.findByPhone(phone)

        return if (expected == code && user != null) {
            pendingVerifications.remove(phone)
            AuthResponse(success = true, userId = user.id, phoneVerified = true, message = "Verificado")
        } else {
            AuthResponse(success = false, message = "Código incorrecto")
        }
    }

    fun saveProfile(request: ProfileRequest): User? {
        val user = repo.findById(request.userId) ?: return null
        val formatter = DateTimeFormatter.ofPattern("MMMM yyyy", java.util.Locale("es", "CO"))
        val updated = user.copy(
            name = request.name,
            username = request.username,
            email = request.email,
            idType = request.idType,
            cedula = request.cedula,
            memberSince = LocalDate.now().format(formatter)
        )
        return repo.update(request.userId, updated)
    }
}
