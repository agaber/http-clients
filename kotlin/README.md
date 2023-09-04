### Sports Stats

A command line tool that prints information about a baseball team given a team
ID or name.

#### Motivation

This app is just a reference for how to make REST API calls in Kotlin. It is
functionally identical to the Java version.

#### Tech Stack

* Spring Boot - I used it because it provids dependency injection and yaml
  config files out of the box.
* ktor - For making HTTP calls.
* Kotlin coroutines - I wanted to learn it and I would most likely use it in any
  real scenario but because the logic here requires synchronous operations,
  it's not necessary (It's the same thing in the  Java version where I go out of
  my way to use Flux even though there's no actual benefit).

#### Execute

See the [README](../java/README.md) in the Java version.
