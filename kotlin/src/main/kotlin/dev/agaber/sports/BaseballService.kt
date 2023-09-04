package dev.agaber.sports

import io.ktor.client.HttpClient
import io.ktor.client.request.get
import io.ktor.client.request.headers
import io.ktor.client.statement.HttpResponse
import io.ktor.client.statement.bodyAsText
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import io.ktor.http.URLProtocol
import io.ktor.http.path
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.decodeFromJsonElement
import kotlinx.serialization.json.jsonObject
import mu.KotlinLogging
import org.apache.commons.csv.CSVFormat
import org.springframework.stereotype.Service
import java.io.StringWriter
import java.net.URL
import java.time.Clock
import java.time.LocalDate

private val headers = mapOf(
  HttpHeaders.Accept to "application/json",
  HttpHeaders.ContentType to "application/json",
)

private val log = KotlinLogging.logger {}

@Service
class BaseballService(
  private val clock: Clock,
  private val config: BaseballConfig,
  private val httpClient: HttpClient,
  private val json: Json,
) {

  suspend fun execute(): String {
    val query = config.team
    val team = fetchMlbTeam(query) ?: return "Not Found"
    return coroutineScope {
      val roster = async { fetchMlbRoster(team) }
      val venue = async { fetchMlbVenueById(team.venue.id) }
      printRoster(roster.await(), team, venue.await()!!)
    }
  }

  private suspend fun fetchMlbRoster(team: MlbTeam): MlbRoster {
    val statsApiParts = urlParts(config.statsApiUrl)
    val response: HttpResponse = httpClient.get {
      headers { headers }
      url {
        protocol = statsApiParts.first
        host = statsApiParts.second
        port = statsApiParts.third
        path("/api/v1/teams/${team.id}/roster")
      }
    }
    return when (response.status) {
      HttpStatusCode.OK -> json.decodeFromString(response.bodyAsText())
      else -> throw Exception("Error looking up ${team.id}: ${response.status}")
    }
  }

  private suspend fun fetchMlbTeam(team: String) =
    if (team.toIntOrNull() != null) fetchMlbTeamById(team)
    else fetchMlbTeamByName(team)

  private suspend fun fetchMlbTeamById(teamId: String): MlbTeam? {
    // 11 returns a team called "Office of the Commissioner".
    if (teamId=="11") {
      return null
    }
    val season = LocalDate.now(clock).year
    val statsApiParts = urlParts(config.statsApiUrl)
    val response: HttpResponse = httpClient.get {
      headers { headers }
      url {
        protocol = statsApiParts.first
        host = statsApiParts.second
        port = statsApiParts.third
        path("/api/v1/teams")
        parameters.append("season", season.toString())
        parameters.append("sportIds", "1")
        parameters.append("teamId", teamId)
      }
    }
    return when (response.status) {
      HttpStatusCode.OK -> {
        val respJson = json.parseToJsonElement(response.bodyAsText()).jsonObject
        return json.decodeFromJsonElement<List<MlbTeam>>(respJson["teams"]!!)
          .firstOrNull { it.active }
      }
      HttpStatusCode.NotFound -> null
      else -> throw Exception("Error looking up team ${teamId}: ${response.status}")
    }
  }

  private suspend fun fetchMlbTeamByName(name: String): MlbTeam? {
    val season = LocalDate.now(clock).year
    val statsApiParts = urlParts(config.statsApiUrl)
    val response: HttpResponse = httpClient.get {
      headers { headers }
      url {
        protocol = statsApiParts.first
        host = statsApiParts.second
        port = statsApiParts.third
        path("/api/v1/teams")
        parameters.append("season", season.toString())
        parameters.append("sportIds", "1")
      }
    }
    return when (response.status) {
      HttpStatusCode.OK -> {
        val respJson = json.parseToJsonElement(response.bodyAsText()).jsonObject
        val matches =
          json.decodeFromJsonElement<List<MlbTeam>>(respJson["teams"]!!)
            .filter { it.active }
            .filter { it.name.contains(name, true) }
        if (matches.size > 1) {
          log.warn { "Multiple teams matched $name. Ambiguous match results in empty response" }
          return null
        }
        return matches.firstOrNull()
      }
      else -> throw Exception("Error looking up team ${name}: ${response.status}")
    }
  }

  /**
   * Fetches a venue from the MLB Statsapi using the venue ID.
   *
   * <p>This call is completely unnecessary because the venue name is already
   * included in the team lookup. I'm just doing this because I want an excuse
   * to do some things in parallel.
   */
  private suspend fun fetchMlbVenueById(id: Int): MlbVenue? {
    val statsApiParts = urlParts(config.statsApiUrl)
    val response: HttpResponse = httpClient.get {
      headers { headers }
      url {
        protocol = statsApiParts.first
        host = statsApiParts.second
        port = statsApiParts.third
        path("/api/v1/venues/${id}")
      }
    }
    return when (response.status) {
      HttpStatusCode.OK -> {
        val respJson = json.parseToJsonElement(response.bodyAsText()).jsonObject
        return json.decodeFromJsonElement<List<MlbVenue>>(respJson["venues"]!!)
          .firstOrNull { it.active }
      }
      HttpStatusCode.NotFound -> null
      else -> throw Exception("Error looking up venue ${id}: ${response.status}")
    }
  }

  private fun printRoster(
      roster: MlbRoster, team: MlbTeam, venue: MlbVenue): String {
    val sw = StringWriter()
    CSVFormat.DEFAULT.print(sw).apply {
      printRecord("Team", "Jersey", "Name", "Position", "Home Stadium")
      roster.roster.filter { it.status.description=="Active" }.forEach {
        printRecord(
            team.name, it.jerseyNumber, it.person.fullName, it.position.abbreviation, venue.name)
      }
    }
    return sw.toString()
  }
}

private fun urlParts(urlString: String): Triple<URLProtocol, String, Int> {
  val url = URL(urlString)
  val port = if (url.port == -1) 0 else url.port
  return Triple(URLProtocol.byName[url.protocol]!!, url.host, port)
}

@Serializable
private data class MlbPerson(val id: Int, val fullName: String)

@Serializable
private data class MlbPlayer(
  val person: MlbPerson,
  val jerseyNumber: String,
  val position: MlbPosition,
  val status: MlbStatus,
)

@Serializable
private data class MlbPosition(
  val name: String,
  val type: String,
  val abbreviation: String,
)

@Serializable
private data class MlbRoster(val roster: List<MlbPlayer>)

@Serializable
private data class MlbStatus(val description: String)

@Serializable
private data class MlbTeam(
  val id: Int,
  val active: Boolean,
  val name: String,
  val locationName: String,
  val teamName: String,
  val venue: Id,
)

@Serializable
private data class MlbVenue(
  val id: Int,
  val name: String,
  val active: Boolean,
)

@Serializable
private data class Id(val id: Int)
