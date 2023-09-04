package dev.agaber.sports

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.context.annotation.Configuration

@Configuration
@ConfigurationProperties("baseball")
data class BaseballConfig(
  var statsApiUrl: String = "",
  var team: String = "",
)
