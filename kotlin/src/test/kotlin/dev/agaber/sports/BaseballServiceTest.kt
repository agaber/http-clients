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
        "GET http://fake:8080/api/v1/venues/2395"
            to  respondJson("""
              { "venues": [{
                  "id": 2395,
                  "name": "Oracle Park",
                  "link": "/api/v1/venues/2395",
                  "active": true,
                  "season": "2023"
                }] }
              """.trimIndent()),
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
        Team,Jersey,Name,Position,Home Stadium
        San Francisco Giants,38,Alex Cobb,P,Oracle Park
        San Francisco Giants,57,Alex Wood,P,Oracle Park
        San Francisco Giants,13,Austin Slater,LF,Oracle Park
        San Francisco Giants,2,Blake Sabol,C,Oracle Park
        San Francisco Giants,75,Camilo Doval,P,Oracle Park
        San Francisco Giants,6,Casey Schmitt,SS,Oracle Park
        San Francisco Giants,7,J.D. Davis,3B,Oracle Park
        San Francisco Giants,34,Jakob Junis,P,Oracle Park
        San Francisco Giants,23,Joc Pederson,DH,Oracle Park
        San Francisco Giants,45,Kyle Harrison,P,Oracle Park
        San Francisco Giants,31,LaMonte Wade Jr.,1B,Oracle Park
        San Francisco Giants,62,Logan Webb,P,Oracle Park
        San Francisco Giants,77,Luke Jackson,P,Oracle Park
        San Francisco Giants,5,Mike Yastrzemski,CF,Oracle Park
        San Francisco Giants,17,Mitch Haniger,LF,Oracle Park
        San Francisco Giants,14,Patrick Bailey,C,Oracle Park
        San Francisco Giants,18,Paul DeJong,SS,Oracle Park
        San Francisco Giants,74,Ryan Walker,P,Oracle Park
        San Francisco Giants,54,Scott Alexander,P,Oracle Park
        San Francisco Giants,52,Sean Manaea,P,Oracle Park
        San Francisco Giants,33,Taylor Rogers,P,Oracle Park
        San Francisco Giants,39,Thairo Estrada,2B,Oracle Park
        San Francisco Giants,43,Tristan Beck,P,Oracle Park
        San Francisco Giants,71,Tyler Rogers,P,Oracle Park
        San Francisco Giants,53,Wade Meckler,OF,Oracle Park
        San Francisco Giants,41,Wilmer Flores,1B,Oracle Park

        """.trimIndent())
    }
  }

  @Test
  fun `lookup team by id and team not found`() {
    runBlocking {
      config.team = "98372"
      val result = baseballService.execute()
      assertThat(result).isEqualTo("Not Found")
    }
  }

  @Test
  fun `lookup team by name`() {
    runBlocking {
      config.team = "giants"
      val result = baseballService.execute()
      assertThat(result).isEqualToNormalizingNewlines("""
        Team,Jersey,Name,Position,Home Stadium
        San Francisco Giants,38,Alex Cobb,P,Oracle Park
        San Francisco Giants,57,Alex Wood,P,Oracle Park
        San Francisco Giants,13,Austin Slater,LF,Oracle Park
        San Francisco Giants,2,Blake Sabol,C,Oracle Park
        San Francisco Giants,75,Camilo Doval,P,Oracle Park
        San Francisco Giants,6,Casey Schmitt,SS,Oracle Park
        San Francisco Giants,7,J.D. Davis,3B,Oracle Park
        San Francisco Giants,34,Jakob Junis,P,Oracle Park
        San Francisco Giants,23,Joc Pederson,DH,Oracle Park
        San Francisco Giants,45,Kyle Harrison,P,Oracle Park
        San Francisco Giants,31,LaMonte Wade Jr.,1B,Oracle Park
        San Francisco Giants,62,Logan Webb,P,Oracle Park
        San Francisco Giants,77,Luke Jackson,P,Oracle Park
        San Francisco Giants,5,Mike Yastrzemski,CF,Oracle Park
        San Francisco Giants,17,Mitch Haniger,LF,Oracle Park
        San Francisco Giants,14,Patrick Bailey,C,Oracle Park
        San Francisco Giants,18,Paul DeJong,SS,Oracle Park
        San Francisco Giants,74,Ryan Walker,P,Oracle Park
        San Francisco Giants,54,Scott Alexander,P,Oracle Park
        San Francisco Giants,52,Sean Manaea,P,Oracle Park
        San Francisco Giants,33,Taylor Rogers,P,Oracle Park
        San Francisco Giants,39,Thairo Estrada,2B,Oracle Park
        San Francisco Giants,43,Tristan Beck,P,Oracle Park
        San Francisco Giants,71,Tyler Rogers,P,Oracle Park
        San Francisco Giants,53,Wade Meckler,OF,Oracle Park
        San Francisco Giants,41,Wilmer Flores,1B,Oracle Park

        """.trimIndent())
    }
  }

  @Test
  fun `lookup team by name and team not found`() {
    runBlocking {
      config.team = "knicks"
      val result = baseballService.execute()
      assertThat(result).isEqualTo("Not Found")
    }
  }

  private fun MockRequestHandleScope.respondJson(json: String) =
    respond(
      content = ByteReadChannel(json),
      headers = headersOf(HttpHeaders.ContentType, "application/json"),
      status = HttpStatusCode.OK,
    )

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
