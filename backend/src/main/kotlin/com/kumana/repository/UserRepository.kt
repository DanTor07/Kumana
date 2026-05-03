package com.kumana.repository

import com.kumana.models.User

class UserRepository {

    private val users = mutableListOf<User>()

    fun findByPhone(phone: String): User? =
        users.find { it.phone == phone }

    fun findById(id: String): User? =
        users.find { it.id == id }

    fun save(user: User): User {
        users.add(user)
        return user
    }

    fun update(id: String, updated: User): User? {
        val index = users.indexOfFirst { it.id == id }
        return if (index >= 0) {
            users[index] = updated
            updated
        } else null
    }

    fun getAll(): List<User> = users.toList()
}
