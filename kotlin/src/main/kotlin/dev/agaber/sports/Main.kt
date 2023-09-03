package dev.agaber.sports

import io.ktor.client.HttpClient
import io.ktor.client.engine.cio.CIO
import io.ktor.client.request.get
import io.ktor.client.statement.HttpResponse
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import kotlinx.serialization.encodeToString

@Serializable
data class User(val name: String, val age: Int)

suspend fun main() {
  val user = User("John Doe", 30)
  println(Json.encodeToString(user))

  val client = HttpClient(CIO)
  val response: HttpResponse = client.get("https://ktor.io/")
  println(response.status)
  client.close()
}
