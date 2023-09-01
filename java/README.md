### Sports Stats

A command line tool that prints information about a baseball team given a team
ID or name.

#### Motivation

This app is just a reference for how to make REST API calls in a Spring Boot app
with Spring Boot and Reactive/WebFlux including unit tests.

It calls the MLB Stats API to lookup team and player information.

#### Execute

Find team by name.

```shell
$ ./gradlew clean build
$ java -jar  build/libs/sports-stats-0.0.1-SNAPSHOT.jar \
  --spring.profiles.active=prod,nologs \
  --baseball.team=mets
```

Find team by ID.

```shell
$ ./gradlew clean build
$ java -jar  build/libs/sports-stats-0.0.1-SNAPSHOT.jar \
  --spring.profiles.active=prod,nologs \
  --baseball.team=137
```

Find team by ID with bootRun

```shell
$ ./gradlew bootRun --args="--baseball.team=137 --spring.profiles.active=prod,nologs"
```

Find team by ID with noisy logs.

```shell
$ ./gradlew clean build
$ java -jar  build/libs/sports-stats-0.0.1-SNAPSHOT.jar \
  --baseball.team=137
```
