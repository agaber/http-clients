import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

plugins {
  id("org.springframework.boot") version "3.1.3"
  id("io.spring.dependency-management") version "1.1.3"
  kotlin("jvm") version "1.8.22"
  kotlin("plugin.serialization") version "1.6.10"
  kotlin("plugin.spring") version "1.8.22"
  application
}

group = "dev.agaber.sports"
version = "1.0"

java {
  sourceCompatibility = JavaVersion.VERSION_17
}

repositories {
  mavenCentral()
}

val ktor_version: String by project

dependencies {
  implementation("io.github.microutils:kotlin-logging:3.0.5")
  implementation("io.ktor:ktor-client-cio:$ktor_version")
  implementation("io.ktor:ktor-client-core:$ktor_version")
  implementation("io.ktor:ktor-client-content-negotiation-jvm:2.3.4")
  implementation("org.apache.commons:commons-csv:1.10.0")
  implementation("org.jetbrains.kotlin:kotlin-reflect")
  implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")
  implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.0")
  implementation("org.springframework.boot:spring-boot-starter")
  testImplementation("io.ktor:ktor-client-mock:$ktor_version")
  testImplementation("org.assertj:assertj-core:3.24.2")
  testImplementation("org.springframework.boot:spring-boot-starter-test")
}

tasks.withType<KotlinCompile> {
  kotlinOptions {
    freeCompilerArgs += "-Xjsr305=strict"
    jvmTarget = "17"
  }
}

tasks.withType<Test> {
  useJUnitPlatform()
}
