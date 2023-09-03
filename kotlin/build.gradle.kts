plugins {
  kotlin("jvm") version "1.8.0"
  kotlin("plugin.serialization") version "1.6.10"
  application
}

group = "dev.agaber.sports"
version = "1.0"

repositories {
  mavenCentral()
}

val ktor_version: String by project

dependencies {
  implementation("io.ktor:ktor-client-core:$ktor_version")
  implementation("io.ktor:ktor-client-cio:$ktor_version")
  implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.0")
  testImplementation(kotlin("test"))
}

tasks.test {
  useJUnitPlatform()
}

kotlin {
  jvmToolchain(8)
}

application {
  mainClass.set("dev.agaber.sports.MainKt")
}

tasks.withType<Test> {
  useJUnitPlatform()
}

tasks {
  val fatJar = register<Jar>("fatJar") {
    dependsOn.addAll(listOf("compileJava", "compileKotlin", "processResources"))
    archiveClassifier.set("standalone")
    duplicatesStrategy = DuplicatesStrategy.EXCLUDE
    manifest {
      attributes(mapOf("Main-Class" to application.mainClass))
    }
    val sourcesMain = sourceSets.main.get()
    val contents = configurations.runtimeClasspath.get()
      .map { if (it.isDirectory) it else zipTree(it) } + sourcesMain.output
    from(contents)
  }

  build {
    // Trigger fat jar creation during build
    dependsOn(fatJar)
  }
}
