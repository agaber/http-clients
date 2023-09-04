package dev.agaber.sports

import io.ktor.client.HttpClient
import io.ktor.client.engine.cio.CIO
import kotlinx.coroutines.runBlocking
import kotlinx.serialization.json.Json
import org.springframework.boot.CommandLineRunner
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import java.time.Clock

@SpringBootApplication
class Application(private val baseballService: BaseballService) : CommandLineRunner {
  override fun run(vararg args: String) {
    runBlocking {
      println(baseballService.execute())
    }
  }
}

@Configuration
class AppConfiguration {
  @Bean
  fun clock(): Clock {
    return Clock.systemUTC()
  }

  @Bean
  fun httpClient(): HttpClient {
    return HttpClient(CIO.create())
  }

  @Bean
  fun json(): Json {
    return Json { ignoreUnknownKeys = true }
  }
}

fun main(args: Array<String>) {
  runApplication<Application>(*args)
}
