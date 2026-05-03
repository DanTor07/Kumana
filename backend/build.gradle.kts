plugins {
    kotlin("jvm") version "1.9.22"
    application
    kotlin("plugin.serialization") version "1.9.22"
}

group = "com.kumana"
version = "1.0.0"

application {
    mainClass.set("com.kumana.MainKt")
}

repositories {
    mavenCentral()
}

dependencies {
    // Ktor server
    implementation("io.ktor:ktor-server-core-jvm:2.3.7")
    implementation("io.ktor:ktor-server-netty-jvm:2.3.7")
    implementation("io.ktor:ktor-server-content-negotiation-jvm:2.3.7")
    implementation("io.ktor:ktor-server-cors-jvm:2.3.7")

    // Ktor client (proxy a APIs externas)
    implementation("io.ktor:ktor-client-core-jvm:2.3.7")
    implementation("io.ktor:ktor-client-cio-jvm:2.3.7")
    implementation("io.ktor:ktor-client-content-negotiation-jvm:2.3.7")

    // Serialización JSON
    implementation("io.ktor:ktor-serialization-kotlinx-json-jvm:2.3.7")

    // Logging
    implementation("ch.qos.logback:logback-classic:1.4.11")

    // Tests
    testImplementation("io.ktor:ktor-server-tests-jvm:2.3.7")
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit:1.9.22")
}

kotlin {
    jvmToolchain(17)
}
