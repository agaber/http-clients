package dev.agaber.sports;

import io.netty.channel.ChannelOption;
import io.netty.handler.timeout.ReadTimeoutHandler;
import io.netty.handler.timeout.WriteTimeoutHandler;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.util.unit.DataSize;
import org.springframework.web.reactive.function.client.ExchangeFilterFunction;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;
import reactor.netty.resources.ConnectionProvider;

import java.time.Duration;

@Configuration
@Slf4j
class HttpClientConfiguration {
  @Configuration
  @ConfigurationProperties("http-client")
  @Data
  static class HttpClientConfig {
    private DataSize maxResponseBufferSize;
    private Duration acquireTimeout;
    private Duration connectionTimeout;
    private Duration evictInterval;
    private Duration idleTime;
    private Duration maxLifeTime;
    private Duration readTimeout;
    private Duration writeTimeout;
    private boolean compress;
    private boolean keepAlive;
    private boolean metrics;
    private boolean wiretap;
    private int maxConnections;
    private int pendingAcquireMaxCount;
  }

  @Bean
  WebClient webClient(HttpClientConfig httpConfig, WebClient.Builder webClientBuilder) {
    var connProvider = ConnectionProvider.builder("webclient-conn-pool")
        .maxConnections(httpConfig.maxConnections)
        .maxIdleTime(httpConfig.idleTime)
        .maxLifeTime(httpConfig.maxLifeTime)
        .evictInBackground(httpConfig.evictInterval)
        .pendingAcquireMaxCount(httpConfig.pendingAcquireMaxCount)
        .pendingAcquireTimeout(httpConfig.acquireTimeout)
        .metrics(httpConfig.metrics)
        .lifo()
        .build();

    var httpClient = HttpClient.create(connProvider)
        .compress(httpConfig.compress)
        .doOnConnected(connection ->
            connection
                .addHandlerLast(new ReadTimeoutHandler((int) httpConfig.readTimeout.toSeconds()))
                .addHandlerLast(new WriteTimeoutHandler((int) httpConfig.writeTimeout.toSeconds())))
        .keepAlive(httpConfig.keepAlive)
        .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, (int) httpConfig.connectionTimeout.toMillis())
        .wiretap(httpConfig.wiretap);

    return webClientBuilder
        .clientConnector(new ReactorClientHttpConnector(httpClient))
        .codecs(configurer ->
            configurer
                .defaultCodecs()
                .maxInMemorySize((int) httpConfig.maxResponseBufferSize.toBytes()))
        .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
        .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
        .build();
  }

  private static ExchangeFilterFunction logRequestAndResponseInfo() {
    return (clientRequest, next) -> {
      log.debug("Request: {} {}", clientRequest.method(), clientRequest.url());
      log.trace("Request headers: {}", clientRequest.headers());
      var responseMono = next.exchange(clientRequest);
      return responseMono.doOnSuccess(clientResponse -> {
        log.debug("Response status: {}", clientResponse.statusCode());
        log.trace("Response headers: {}", clientResponse.headers().asHttpHeaders());
      });
    };
  }
}
