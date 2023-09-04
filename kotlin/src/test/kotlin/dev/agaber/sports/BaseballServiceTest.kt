package dev.agaber.sports

import dev.agaber.sports.testing.FakeClock
import io.ktor.client.HttpClient
import io.ktor.client.engine.mock.MockEngine
import io.ktor.client.engine.mock.MockRequestHandleScope
import io.ktor.client.engine.mock.respond
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import io.ktor.http.headersOf
import io.ktor.utils.io.ByteReadChannel
import kotlinx.coroutines.runBlocking
import kotlinx.serialization.json.Json
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import java.time.LocalDate

private val clock = FakeClock(LocalDate.of(2023, 9, 1))
private val json = Json { ignoreUnknownKeys = true }

class BaseballServiceTest {
  private lateinit var config: BaseballConfig
  private lateinit var baseballService: BaseballService

  @BeforeEach
  fun beforeEach() {
    val mockEngine = MockEngine { request ->
      val responseMap = mapOf(
        "GET http://fake:8080/api/v1/teams?season=2023&sportIds=1&teamId=137"
            to  respond("team-137.json"),
        "GET http://fake:8080/api/v1/teams?season=2023&sportIds=1"
            to  respond("teams-allmlb.json"),
        "GET http://fake:8080/api/v1/teams/137/roster"
            to  respond("team-137-roster.json"),
      )
      val requestStr = "${request.method.value} ${request.url}"
      responseMap.getOrDefault(requestStr, respond(HttpStatusCode.NotFound))
    }
    val httpClient = HttpClient(mockEngine)
    config = BaseballConfig(statsApiUrl = "http://fake:8080", "")
    baseballService = BaseballService(clock, config, httpClient, json)
  }

  @Test
  fun `lookup team by id`() {
    runBlocking {
      config.team = "137"
      val result = baseballService.execute()
      assertThat(result).isEqualToNormalizingNewlines("""
        Team,Jersey,Name,Position
        San Francisco Giants,38,Alex Cobb,P
        San Francisco Giants,57,Alex Wood,P
        San Francisco Giants,13,Austin Slater,LF
        San Francisco Giants,2,Blake Sabol,C
        San Francisco Giants,75,Camilo Doval,P
        San Francisco Giants,6,Casey Schmitt,SS
        San Francisco Giants,7,J.D. Davis,3B
        San Francisco Giants,34,Jakob Junis,P
        San Francisco Giants,23,Joc Pederson,DH
        San Francisco Giants,45,Kyle Harrison,P
        San Francisco Giants,31,LaMonte Wade Jr.,1B
        San Francisco Giants,62,Logan Webb,P
        San Francisco Giants,77,Luke Jackson,P
        San Francisco Giants,5,Mike Yastrzemski,CF
        San Francisco Giants,17,Mitch Haniger,LF
        San Francisco Giants,14,Patrick Bailey,C
        San Francisco Giants,18,Paul DeJong,SS
        San Francisco Giants,74,Ryan Walker,P
        San Francisco Giants,54,Scott Alexander,P
        San Francisco Giants,52,Sean Manaea,P
        San Francisco Giants,33,Taylor Rogers,P
        San Francisco Giants,39,Thairo Estrada,2B
        San Francisco Giants,43,Tristan Beck,P
        San Francisco Giants,71,Tyler Rogers,P
        San Francisco Giants,53,Wade Meckler,OF
        San Francisco Giants,41,Wilmer Flores,1B

        """.trimIndent())
    }
  }

  @Test
  fun `lookup team by name`() {
    runBlocking {
      config.team = "giants"
      val result = baseballService.execute()
      assertThat(result).isEqualToNormalizingNewlines("""
        Team,Jersey,Name,Position
        San Francisco Giants,38,Alex Cobb,P
        San Francisco Giants,57,Alex Wood,P
        San Francisco Giants,13,Austin Slater,LF
        San Francisco Giants,2,Blake Sabol,C
        San Francisco Giants,75,Camilo Doval,P
        San Francisco Giants,6,Casey Schmitt,SS
        San Francisco Giants,7,J.D. Davis,3B
        San Francisco Giants,34,Jakob Junis,P
        San Francisco Giants,23,Joc Pederson,DH
        San Francisco Giants,45,Kyle Harrison,P
        San Francisco Giants,31,LaMonte Wade Jr.,1B
        San Francisco Giants,62,Logan Webb,P
        San Francisco Giants,77,Luke Jackson,P
        San Francisco Giants,5,Mike Yastrzemski,CF
        San Francisco Giants,17,Mitch Haniger,LF
        San Francisco Giants,14,Patrick Bailey,C
        San Francisco Giants,18,Paul DeJong,SS
        San Francisco Giants,74,Ryan Walker,P
        San Francisco Giants,54,Scott Alexander,P
        San Francisco Giants,52,Sean Manaea,P
        San Francisco Giants,33,Taylor Rogers,P
        San Francisco Giants,39,Thairo Estrada,2B
        San Francisco Giants,43,Tristan Beck,P
        San Francisco Giants,71,Tyler Rogers,P
        San Francisco Giants,53,Wade Meckler,OF
        San Francisco Giants,41,Wilmer Flores,1B

        """.trimIndent())
    }
  }

  private fun MockRequestHandleScope.respond(fileName: String) =
    respond(
      content = ByteReadChannel(read(fileName)),
      headers = headersOf(HttpHeaders.ContentType, "application/json"),
      status = HttpStatusCode.OK,
    )

  private fun MockRequestHandleScope.respond(statusCode: HttpStatusCode) =
    respond(
      content = ByteReadChannel(""),
      headers = headersOf(HttpHeaders.ContentType, "application/json"),
      status = statusCode,
    )

  private fun read(fileName: String): String {
    val path = "/${this::class.java.packageName.replace(".", "/")}/$fileName"
    return this::class.java.getResourceAsStream(path).bufferedReader().readText()
  }
}
