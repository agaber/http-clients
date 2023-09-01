package dev.agaber.sports;

import com.fasterxml.jackson.datatype.guava.GuavaModule;
import dev.agaber.sports.baseball.BaseballTeamService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.WebApplicationType;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import reactor.core.scheduler.Scheduler;
import reactor.core.scheduler.Schedulers;

import java.time.Clock;
import java.time.Duration;
import java.util.concurrent.Executors;

@Slf4j
@SpringBootApplication
public class Application implements CommandLineRunner {
  private final BaseballTeamService baseballTeamService;
  private final Scheduler scheduler;
  private final boolean isTest;

  Application(
      @Value("${isTest}") boolean isTest,
      BaseballTeamService baseballTeamService,
      Scheduler scheduler) {
    this.baseballTeamService = baseballTeamService;
    this.isTest = isTest;
    this.scheduler = scheduler;
  }

  public static void main(String[] args) {
    new SpringApplicationBuilder(Application.class)
        .web(WebApplicationType.NONE)
        .run(args);
  }

  @Override
  public void run(String... args) throws Exception {
    if (isTest) {
      // Without this hack, the application will run during unit tests.
      System.err.println("isTest set to true. Exiting.");
      return;
    }

    var teamInfo = baseballTeamService.execute()
        .subscribeOn(scheduler)
        .block(Duration.ofSeconds(10));
    System.out.println(teamInfo);

    // Must dispose otherwise the command line app will not terminate.
    scheduler.dispose();
  }

  @Configuration
  static class ApplicationConfig {
    @Bean
    Clock clock() {
      return Clock.systemUTC();
    }

    @Bean
    com.fasterxml.jackson.databind.Module guavaModule() {
      return new GuavaModule();
    }

    @Bean
    Scheduler scheduler(@Value("${spring.datasource.maximum-pool-size:10}") int connPoolSize) {
      return Schedulers.fromExecutor(Executors.newFixedThreadPool(connPoolSize));
    }
  }
}
