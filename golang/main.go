package main

import (
	"flag"
	"fmt"
	"strings"
	"time"

	"agaber.dev/sports-stats/baseball"
)

func main() {
	var team string
	flag.StringVar(&team, "team", "", "'Specify a team id or search query")
	flag.Parse()
	result := baseball.Execute("https://statsapi.mlb.com", team, time.Now())
	fmt.Println(strings.TrimSpace(result))
}
