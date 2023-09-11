package dev.agaber.sports.baseball;

import static com.github.tomakehurst.wiremock.client.WireMock.aResponse;
import static com.github.tomakehurst.wiremock.client.WireMock.equalTo;
import static com.github.tomakehurst.wiremock.client.WireMock.stubFor;
import static com.github.tomakehurst.wiremock.client.WireMock.urlPathEqualTo;
import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.tomakehurst.wiremock.client.WireMock;
import dev.agaber.sports.testing.FakeClock;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cloud.contract.wiremock.AutoConfigureWireMock;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.File;
import java.io.IOException;
import java.net.URISyntaxException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.time.Duration;
import java.time.LocalDate;

@ActiveProfiles("test")
@AutoConfigureWireMock(port = 0)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
final class BaseballTeamServiceTest {
  @Autowired
  private ObjectMapper objectMapper;

  @Autowired
  private WebClient webClient;

  @Value("#{${wiremock.server.port}}")
  private int mockServerPort;

  @BeforeEach
  void beforeEach() throws Exception {
    WireMock.reset();

    stubFor(WireMock.get(urlPathEqualTo("/api/v1/teams"))
        .withQueryParam("season", equalTo("2023"))
        .withQueryParam("sportIds", equalTo("1"))
        .willReturn(aResponse()
            .withHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
            .withBody(read("teams-allmlb.json"))));

    stubFor(WireMock.get(urlPathEqualTo("/api/v1/teams/137"))
        .willReturn(aResponse()
            .withHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
            .withBody(read("team-137.json"))));

    stubFor(WireMock.get(urlPathEqualTo("/api/v1/teams/137/roster"))
        .willReturn(aResponse()
            .withHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
            .withBody(read("team-137-roster.json"))));

    stubFor(WireMock.get(urlPathEqualTo("/api/v1/venues/2395"))
        .willReturn(aResponse()
            .withHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
            .withBody(read("venue-2395.json"))));
  }

  @Test
  void printTeamInfo_byTeamId() throws Exception {
    var teamInfo = execute("137");
    assertThat(teamInfo).isEqualToNormalizingNewlines(EXPECTED_GIANTS_OUTPUT);
  }

  @Test
  void printTeamInfo_byTeamIdNotFound_printNotFound() throws Exception {
    var teamInfo = execute("999");
    assertThat(teamInfo).isEqualTo("Not Found");
  }

  @Test
  void printTeamInfo_byTeamName() throws Exception {
    var teamInfo = execute("Giants");
    assertThat(teamInfo).isEqualToNormalizingNewlines(EXPECTED_GIANTS_OUTPUT);
  }

  @Test
  void printTeamInfo_byTeamNameNotFound_printNotFound() throws Exception {
    var teamInfo = execute("knicks");
    assertThat(teamInfo).isEqualToNormalizingNewlines("Not Found");
  }

  // TODO: Test more ways of searching for teams by name.

  private String execute(String team) {
    var config = new BaseballConfig();
    config.setStatsApiUrl("http://localhost:" + mockServerPort);
    config.setTeam(team);
    var clock = new FakeClock(LocalDate.of(2023, 9, 1));
    var service = new BaseballTeamService(config, clock, objectMapper, webClient);
    return service.execute().block(Duration.ofSeconds(2));
  }

  private static String read(String fileName) throws IOException, URISyntaxException {
    var clazz = BaseballTeamServiceTest.class;
    var path = String.format(
        "%s/%s",
        clazz.getPackageName().replace(".", "/"),
        fileName);
    var resource = clazz.getClassLoader().getResource(path);
    return Files.readString(new File(resource.toURI()).toPath(), StandardCharsets.UTF_8);
  }

  private static final String EXPECTED_GIANTS_OUTPUT = """
      Team,Jersey,Name,Position,Home Stadium
      San Francisco Giants,31,LaMonte Wade Jr.,1B,Oracle Park
      San Francisco Giants,41,Wilmer Flores,1B,Oracle Park
      San Francisco Giants,39,Thairo Estrada,2B,Oracle Park
      San Francisco Giants,7,J.D. Davis,3B,Oracle Park
      San Francisco Giants,2,Blake Sabol,C,Oracle Park
      San Francisco Giants,14,Patrick Bailey,C,Oracle Park
      San Francisco Giants,5,Mike Yastrzemski,CF,Oracle Park
      San Francisco Giants,23,Joc Pederson,DH,Oracle Park
      San Francisco Giants,13,Austin Slater,LF,Oracle Park
      San Francisco Giants,17,Mitch Haniger,LF,Oracle Park
      San Francisco Giants,53,Wade Meckler,OF,Oracle Park
      San Francisco Giants,38,Alex Cobb,P,Oracle Park
      San Francisco Giants,57,Alex Wood,P,Oracle Park
      San Francisco Giants,75,Camilo Doval,P,Oracle Park
      San Francisco Giants,34,Jakob Junis,P,Oracle Park
      San Francisco Giants,45,Kyle Harrison,P,Oracle Park
      San Francisco Giants,62,Logan Webb,P,Oracle Park
      San Francisco Giants,77,Luke Jackson,P,Oracle Park
      San Francisco Giants,74,Ryan Walker,P,Oracle Park
      San Francisco Giants,54,Scott Alexander,P,Oracle Park
      San Francisco Giants,52,Sean Manaea,P,Oracle Park
      San Francisco Giants,33,Taylor Rogers,P,Oracle Park
      San Francisco Giants,43,Tristan Beck,P,Oracle Park
      San Francisco Giants,71,Tyler Rogers,P,Oracle Park
      San Francisco Giants,6,Casey Schmitt,SS,Oracle Park
      San Francisco Giants,18,Paul DeJong,SS,Oracle Park
      """;
}
