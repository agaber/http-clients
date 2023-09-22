### Sports Stats

A command line tool that prints information about a baseball team given a team
ID or name.

#### Motivation

This app is just a reference for how to make REST API calls in Go. It is
functionally identical to the other versions in this repo.

### Test and Compile

```sh
$ cd src/
$ go test ./...
$ go build
```

#### Execute

Look up by query.

```sh
$ ./sports-stats --team=card
```

Lookup by ID

```sh
$ ./sports-stats --team=113
```

Lookup by ID without creating an executable binary

```sh
$ go run . --team=113
```
