package baseball

import (
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"
)

var mockServer *httptest.Server
var now time.Time

func setup() {
	mockServer = httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Not Found", http.StatusNotFound)
			return
		}
		switch r.URL.Path {
		case "/api/v1/teams/137":
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(read("team-137.json")))
			break
		case "/api/v1/teams/":
			query := r.URL.Query()
			seasonParam := query.Get("season")
			sportIdsParam := query.Get("sportIds")
			if seasonParam == "2023" && sportIdsParam == "1" {
				w.WriteHeader(http.StatusOK)
				w.Write([]byte(read("teams.json")))
			} else {
				http.Error(w, "Not Found", http.StatusNotFound)
			}
			break
		case "/api/v1/teams/137/roster":
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(read("team-137-roster.json")))
			break
		case "/api/v1/venues/2395":
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(read("venue-2395.json")))
			break
		default:
			http.Error(w, "Not Found", http.StatusNotFound)
		}
	}))
	now = time.Date(2023, time.September, 6, 15, 30, 0, 0, time.UTC)
}

func teardown() {
	mockServer.Close()
}

func TestLookupTeamById(t *testing.T) {
	setup()
	defer teardown()
	result := Execute(mockServer.URL, "137", now)
	if result != EXPECTED_GIANTS {
		t.Errorf("got %s, wanted %q", result, EXPECTED_GIANTS)
	}
}

func TestLookupByTeamIdNotFound(t *testing.T) {
	setup()
	defer teardown()
	result := Execute(mockServer.URL, "999", now)
	expected := "Not Found"
	if result != expected {
		t.Errorf("got %s, wanted %s", result, expected)
	}
}

func TestLookupTeamByName(t *testing.T) {
	setup()
	defer teardown()
	result := Execute(mockServer.URL, "san fran", now)
	if result != EXPECTED_GIANTS {
		t.Errorf("got %s, wanted %q", result, EXPECTED_GIANTS)
	}
}

func TestLookupByTeamNameNotFound(t *testing.T) {
	setup()
	defer teardown()
	result := Execute(mockServer.URL, "knicks", now)
	expected := "Not Found"
	if result != expected {
		t.Errorf("got %s, wanted %s", result, expected)
	}
}

func read(fileName string) string {
	file, err := os.Open(fmt.Sprintf("./testing/%s", fileName))
	if err != nil {
		panic(fmt.Sprintf("Error opening file: %v", err))
	}
	defer file.Close()

	content, err := io.ReadAll(file)
	if err != nil {
		panic(fmt.Sprintf("Error reading file: %v", err))
	}

	return string(content)
}

const EXPECTED_GIANTS = `Team,Jersey,Name,Position,Home Stadium
San Francisco Giants,38,Alex Cobb,P,Oracle Park
San Francisco Giants,57,Alex Wood,P,Oracle Park
San Francisco Giants,13,Austin Slater,LF,Oracle Park
San Francisco Giants,2,Blake Sabol,C,Oracle Park
San Francisco Giants,75,Camilo Doval,P,Oracle Park
San Francisco Giants,6,Casey Schmitt,SS,Oracle Park
San Francisco Giants,7,J.D. Davis,3B,Oracle Park
San Francisco Giants,34,Jakob Junis,P,Oracle Park
San Francisco Giants,23,Joc Pederson,DH,Oracle Park
San Francisco Giants,45,Kyle Harrison,P,Oracle Park
San Francisco Giants,31,LaMonte Wade Jr.,1B,Oracle Park
San Francisco Giants,62,Logan Webb,P,Oracle Park
San Francisco Giants,77,Luke Jackson,P,Oracle Park
San Francisco Giants,5,Mike Yastrzemski,CF,Oracle Park
San Francisco Giants,17,Mitch Haniger,LF,Oracle Park
San Francisco Giants,14,Patrick Bailey,C,Oracle Park
San Francisco Giants,18,Paul DeJong,SS,Oracle Park
San Francisco Giants,74,Ryan Walker,P,Oracle Park
San Francisco Giants,54,Scott Alexander,P,Oracle Park
San Francisco Giants,52,Sean Manaea,P,Oracle Park
San Francisco Giants,33,Taylor Rogers,P,Oracle Park
San Francisco Giants,39,Thairo Estrada,2B,Oracle Park
San Francisco Giants,43,Tristan Beck,P,Oracle Park
San Francisco Giants,71,Tyler Rogers,P,Oracle Park
San Francisco Giants,53,Wade Meckler,OF,Oracle Park
San Francisco Giants,41,Wilmer Flores,1B,Oracle Park
`
