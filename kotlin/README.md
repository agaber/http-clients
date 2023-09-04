### Sports Stats

A command line tool that prints information about a baseball team given a team
ID or name.

#### Motivation

This app is just a reference for how to make REST API calls in Kotlin. It is
functionally identical to the Java version.

#### Tech Stack

* Spring Boot - I used it because it provides dependency injection and yaml
  config files out of the box. I'm guessing that most server-side work done in
  Kotlin is probably using Spring so it seemed worthwhile to include it as a
  reference. Android dev story is probably different.
* ktor - For making HTTP calls.
* Kotlin coroutines - The built-in way to do async things in Kotlin. This
  project doesn't really need async behavior so I shoehorned an unnecessary
  API call just so I could demonstrate this framework.

#### Execute

See the [README](../java/README.md) in the Java version.
