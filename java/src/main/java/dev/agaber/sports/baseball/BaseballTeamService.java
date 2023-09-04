package dev.agaber.sports.baseball;

import static com.google.common.collect.ImmutableList.toImmutableList;
import static java.util.Comparator.comparing;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.Iterables;
import lombok.Builder;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.csv.CSVFormat;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuples;

import java.io.IOException;
import java.io.StringWriter;
import java.net.URI;
import java.time.Clock;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public final class BaseballTeamService {
  private final BaseballConfig config;
  private final Clock clock;
  private final ObjectMapper objectMapper;
  private final WebClient webClient;

  BaseballTeamService(
      BaseballConfig config,
      Clock clock,
      ObjectMapper objectMapper,
      WebClient webClient) {
    this.clock = clock;
    this.config = config;
    this.objectMapper = objectMapper;
    this.webClient = webClient;
  }

  public Mono<String> execute() {
    // The call to lookup Venue is unnecessary because enough venue information
    // is already present in the team response. It's here to give a reason for
    // using async Flux code.
    var teamMono = fetchMlbTeam(config.getTeam())
        .filter(Optional::isPresent)
        .map(Optional::get);
    var rosterMono = teamMono.flatMap(this::fetchMlbRoster);
    var venueMono = teamMono.flatMap(team -> fetchMlbVenueById(team.venue().id()));
    return teamMono
        .zipWith(rosterMono, (team, roster) -> Tuples.of(team, roster))
        .zipWith(venueMono, (tuple, venue) -> Tuples.of(tuple.getT1(), tuple.getT2(), venue))
        .map(tuple -> printRoster(tuple.getT2(), tuple.getT1(), tuple.getT3()))
        .defaultIfEmpty("Not Found");
  }

  private Mono<MlbRoster> fetchMlbRoster(MlbTeam team) {
    var uri = UriComponentsBuilder.newInstance()
        .uri(URI.create(config.getStatsApiUrl()))
        .path("/api/v1/teams/" + team.id() + "/roster")
        .build(true)
        .toUri();
    return webClient.get()
        .uri(uri)
        .exchangeToMono(response ->
            response.statusCode() == HttpStatus.OK
                ? response.bodyToMono(MlbRoster.class)
                : response.createError());
  }

  private Mono<Optional<MlbTeam>> fetchMlbTeam(String query) {
    boolean isInt = query.matches("^[0-9]*$");
    return isInt ? fetchMlbTeamById(query) : fetchMlbTeamByName(query);
  }

  private Mono<Optional<MlbTeam>> fetchMlbTeamById(String teamId) {
    // 11 returns a team called "Office of the Commissioner".
    if (teamId.equals("11")) {
      return Mono.just(Optional.empty());
    }
    var season = LocalDate.now(clock).getYear();
    var uri = UriComponentsBuilder.newInstance()
        .uri(URI.create(config.getStatsApiUrl()))
        .path("/api/v1/teams")
        .queryParam("season", season)
        .queryParam("sportIds", "1")
        .queryParam("teamId", teamId)
        .build(true)
        .toUri();
    return webClient.get()
        .uri(uri)
        .exchangeToMono(response -> {
          if (response.statusCode() == HttpStatus.OK) {
            return response.bodyToMono(JsonNode.class)
                .map(json -> json.get("teams"))
                .map(v -> objectMapper.convertValue(v, new TypeReference<List<MlbTeam>>() {}))
                .map(teams -> teams.stream().filter(MlbTeam::active).findFirst());
          } else if (response.statusCode() == HttpStatus.NOT_FOUND) {
            log.warn("Could not find team with ID {}", teamId);
            return Mono.just(Optional.empty());
          } else {
            return response.createError();
          }
        });
  }

  private Mono<Optional<MlbTeam>> fetchMlbTeamByName(String teamName) {
    var season = LocalDate.now(clock).getYear();
    var uri = UriComponentsBuilder.newInstance()
        .uri(URI.create(config.getStatsApiUrl()))
        .path("/api/v1/teams")
        .queryParam("season", season)
        .queryParam("sportIds", 1)
        .build(true)
        .toUri();
    return webClient.get()
        .uri(uri)
        .exchangeToMono(response -> {
          if (response.statusCode() == HttpStatus.OK) {
            return response.bodyToMono(JsonNode.class)
                .map(json -> json.get("teams"))
                .map(j -> objectMapper.convertValue(j, new TypeReference<List<MlbTeam>>() {}))
                .map(teams -> filterTeamsByName(teams, teamName));
          } else {
            return response.createError();
          }
        });
  }

  private static Optional<MlbTeam> filterTeamsByName(List<MlbTeam> teams, String name) {
    var matches = teams.stream()
        .filter(team -> team.name().toLowerCase().contains(name.toLowerCase()))
        .collect(toImmutableList());
    if (matches.size() > 1) {
      log.warn("Multiple teams matched {}. Ambiguous match results in empty response", name);
      return Optional.empty();
    }
    return Optional.ofNullable(Iterables.getOnlyElement(matches, null));
  }

  private Mono<MlbVenue> fetchMlbVenueById(int venueId) {
    var uri = UriComponentsBuilder.newInstance()
        .uri(URI.create(config.getStatsApiUrl()))
        .path("/api/v1/venues/" + venueId)
        .build(true)
        .toUri();
    return webClient.get()
        .uri(uri)
        .exchangeToMono(response -> {
          if (response.statusCode() == HttpStatus.OK) {
            return response.bodyToMono(JsonNode.class)
                .map(json -> json.get("venues"))
                .map(v -> objectMapper.convertValue(v, new TypeReference<List<MlbVenue>>() {
                }))
                .map(venues -> Iterables.getOnlyElement(venues));
          } else {
            return response.createError();
          }
        });
  }

  private String printRoster(MlbRoster roster, MlbTeam team, MlbVenue venue) {
    var sw = new StringWriter();
    try (var printer = CSVFormat.DEFAULT.print(sw)) {
      printer.printRecord("Team", "Jersey", "Name", "Position", "Home Stadium");
      var players = roster.roster().stream()
          .sorted(comparing(player -> player.position.abbreviation))
          .collect(toImmutableList());
      for (var player : players) {
        printer.printRecord(
            team.name(),
            player.jerseyNumber(),
            player.person().fullName(),
            player.position().abbreviation(),
            venue.name);
      }
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
    return sw.toString();
  }

  // MLB statsapi objects.

  @Builder(toBuilder = true)
  private record MlbPerson(int id, String fullName) {}

  @Builder(toBuilder = true)
  private record MlbPlayer(
      MlbPerson person,
      String jerseyNumber,
      MlbPosition position,
      MlbStatus status) {
  }

  @Builder(toBuilder = true)
  private record MlbPosition(String name, String type, String abbreviation) {}

  @Builder(toBuilder = true)
  private record MlbRoster(ImmutableList<MlbPlayer> roster) {}

  @Builder(toBuilder = true)
  private record MlbStatus(String description) {}

  @Builder(toBuilder = true)
  private record MlbTeam(
      int id,
      boolean active,
      String name,
      String locationName,
      String teamName,
      Id venue) {
  }

  @Builder(toBuilder = true)
  private record MlbVenue(
      int id,
      String name,
      boolean active) {
  }

  @Builder(toBuilder = true)
  private record Id(int id) {}
}
