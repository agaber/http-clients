package dev.agaber.sports;

import com.fasterxml.jackson.datatype.guava.GuavaModule;
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
import java.util.concurrent.Executors;

@Slf4j
@SpringBootApplication
public class Application implements CommandLineRunner {

  public static void main(String[] args) {
    new SpringApplicationBuilder(Application.class)
        .web(WebApplicationType.NONE)
        .run(args);
  }

  @Override
  public void run(String... args) throws Exception {
    log.info("cool");
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
