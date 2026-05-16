package com.kumana.repository

import com.kumana.config.FirestoreConfig
import com.kumana.models.User

class UserRepository {

    private val col = FirestoreConfig.db.collection("users")

    private fun Map<String, Any>.toUser(id: String) = User(
        id = id,
        phone = this["phone"] as? String ?: "",
        countryCode = this["countryCode"] as? String ?: "",
        name = this["name"] as? String ?: "",
        username = this["username"] as? String ?: "",
        email = this["email"] as? String ?: "",
        idType = this["idType"] as? String ?: "CC",
        cedula = this["cedula"] as? String ?: "",
        memberSince = this["memberSince"] as? String ?: ""
    )

    fun findByPhone(phone: String): User? {
        val docs = col.whereEqualTo("phone", phone).get().get()
        val doc = docs.documents.firstOrNull() ?: return null
        return doc.data?.toUser(doc.id)
    }

    fun findById(id: String): User? {
        val doc = col.document(id).get().get()
        return if (doc.exists()) doc.data?.toUser(doc.id) else null
    }

    fun save(user: User): User {
        col.document(user.id).set(user.toFirestore()).get()
        return user
    }

    fun update(user: User): User = save(user)

    private fun User.toFirestore() = mapOf(
        "phone" to phone,
        "countryCode" to countryCode,
        "name" to name,
        "username" to username,
        "email" to email,
        "idType" to idType,
        "cedula" to cedula,
        "memberSince" to memberSince
    )
}
