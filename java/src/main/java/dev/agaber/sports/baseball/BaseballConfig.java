package dev.agaber.sports.baseball;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties("baseball")
@Data
public class BaseballConfig {
  private String statsApiUrl;
  private String team;
}
