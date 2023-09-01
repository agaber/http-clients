plugins {
	java
	id("org.springframework.boot") version "3.1.3"
	id("io.spring.dependency-management") version "1.1.3"
}

group = "dev.agaber.sports.stats"
version = "0.0.1-SNAPSHOT"

java {
	sourceCompatibility = JavaVersion.VERSION_17
}

configurations {
	compileOnly {
		extendsFrom(configurations.annotationProcessor.get())
	}
}

repositories {
	mavenCentral()
}

dependencies {
	annotationProcessor("org.projectlombok:lombok")
	annotationProcessor("org.springframework.boot:spring-boot-configuration-processor")
	compileOnly("org.projectlombok:lombok")
  implementation("com.fasterxml.jackson.datatype:jackson-datatype-guava:2.15.2")
  implementation("com.google.guava:guava:32.1.2-jre")
  implementation("org.apache.commons:commons-csv:1.10.0")
  implementation("org.springframework.boot:spring-boot-starter-webflux")
  testImplementation("com.github.tomakehurst:wiremock-jre8-standalone:2.35.0")
  testImplementation("io.projectreactor:reactor-test")
  testImplementation("org.assertj:assertj-core:3.24.2")
  testImplementation("org.junit.jupiter:junit-jupiter:5.10.0")
  testImplementation("org.springframework.boot:spring-boot-starter-test")
  testImplementation("org.springframework.cloud:spring-cloud-contract-wiremock:4.0.4")
  testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

tasks.withType<Test> {
	useJUnitPlatform()
}
