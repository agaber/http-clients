package baseball

import (
	"bytes"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"
	"time"
)

func Execute(baseUrl string, query string, now time.Time) string {
	team := fetchMlbTeam(baseUrl, query, now)
	if team == nil {
		return "Not Found"
	}

	// Fetch roster asynchronously
	rosterChan := make(chan *mlbRoster)
	go func() {
		roster := fetchMlbRoster(baseUrl, team.Id)
		rosterChan <- roster
	}()

	// Fetch venue asynchronously
	venueChan := make(chan *mlbVenue)
	go func() {
		venue := fetchMlbVenueById(baseUrl, team.Venue.Id)
		venueChan <- venue
	}()

	// Wait for results from both channels
	roster := <-rosterChan
	close(rosterChan)

	venue := <-venueChan
	close(venueChan)

	return printRoster(*roster, *team, *venue)
}

func fetchMlbRoster(baseUrl string, teamId int) *mlbRoster {
	apiUrl := fmt.Sprintf("%s/api/v1/teams/%d/roster", baseUrl, teamId)
	req, _ := http.NewRequest("GET", apiUrl, nil)
	req.Header.Add("Accept", "application/json")
	req.Header.Add("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Println("Error sending request:", err)
		return &mlbRoster{}
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		fmt.Println("Response Status: ", resp.Status)
		return &mlbRoster{}
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("Error reading response body:", err)
		return &mlbRoster{}
	}

	var data mlbRoster
	if err := json.Unmarshal(body, &data); err != nil {
		fmt.Println("Body: " + string(body))
		fmt.Println("Error unmarshaling JSON: ", err)
		return &mlbRoster{}
	}

	return &data
}

func fetchMlbTeam(baseUrl string, query string, now time.Time) *mlbTeam {
	_, err := strconv.Atoi(query)
	isInt := err == nil
	if isInt {
		return fetchMlbTeamById(baseUrl, query)
	} else {
		return fetchMlbTeamByName(baseUrl, query, now)
	}
}

func fetchMlbTeamById(baseUrl string, id string) *mlbTeam {
	apiUrl := baseUrl + "/api/v1/teams/" + id
	req, _ := http.NewRequest("GET", apiUrl, nil)
	req.Header.Add("Accept", "application/json")
	req.Header.Add("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Println("Error sending request:", err)
		return nil
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusNotFound {
		fmt.Println("Could not find team with id " + id)
		return nil
	} else if resp.StatusCode != http.StatusOK {
		fmt.Println("Response Status: ", resp.Status)
		return nil
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("Error reading response body:", err)
		return nil
	}

	var data mlbTeams
	if err := json.Unmarshal(body, &data); err != nil {
		fmt.Println("Body: " + string(body))
		fmt.Println("Error unmarshaling JSON: ", err)
		return nil
	}

	if len(data.Teams) != 1 {
		fmt.Println("Could not find team with id " + id)
		return nil
	}

	return &data.Teams[0]
}

func fetchMlbTeamByName(baseUrl string, teamName string, now time.Time) *mlbTeam {
	apiUrl := baseUrl + "/api/v1/teams/"
	req, _ := http.NewRequest("GET", apiUrl, nil)
	req.Header.Add("Accept", "application/json")
	req.Header.Add("Content-Type", "application/json")

	query := req.URL.Query()
	query.Add("season", fmt.Sprintf("%d", now.Year()))
	query.Add("sportIds", "1")
	req.URL.RawQuery = query.Encode()

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Println("Error sending request:", err)
		return nil
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusNotFound {
		fmt.Println("Could not find team with name " + teamName)
		return nil
	} else if resp.StatusCode != http.StatusOK {
		fmt.Println("Response Status: ", resp.Status)
		return nil
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("Error reading response body:", err)
		return nil
	}

	var data mlbTeams
	if err := json.Unmarshal(body, &data); err != nil {
		fmt.Println("Body: " + string(body))
		fmt.Println("Error unmarshaling JSON: ", err)
		return nil
	}

	for _, team := range data.Teams {
		if strings.Contains(strings.ToLower(team.Name), strings.ToLower(teamName)) {
			return &team
		}
	}

	fmt.Println("Could not find team with name " + teamName)
	return nil
}

func fetchMlbVenueById(baseUrl string, venueId int) *mlbVenue {
	apiUrl := fmt.Sprintf("%s/api/v1/venues/%d", baseUrl, venueId)
	req, _ := http.NewRequest("GET", apiUrl, nil)
	req.Header.Add("Accept", "application/json")
	req.Header.Add("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Println("Error sending request:", err)
		return nil
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusNotFound {
		fmt.Printf("Could not find venue with id %d\n", venueId)
		return nil
	} else if resp.StatusCode != http.StatusOK {
		fmt.Printf("Response Status for venueId: %d: %s\n", venueId, resp.Status)
		return nil
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("Error reading response body:", err)
		return nil
	}

	var data mlbVenues
	if err := json.Unmarshal(body, &data); err != nil {
		fmt.Println("Body: " + string(body))
		fmt.Println("Error unmarshaling JSON: ", err)
		return nil
	}

	if len(data.Venues) != 1 {
		fmt.Printf("Could not find venue with id %d\n", venueId)
		return nil
	}

	return &data.Venues[0]
}

func printRoster(roster mlbRoster, team mlbTeam, venue mlbVenue) string {
	var csvContent bytes.Buffer
	writer := csv.NewWriter(&csvContent)

	err := writer.Write([]string{"Team", "Jersey", "Name", "Position", "Home Stadium"})
	if err != nil {
		fmt.Println("Error flushing CSV writer:", err)
	}

	// Write the data to the CSV buffer
	for _, player := range roster.Roster {
		row := []string{
			team.Name,
			player.JerseyNumber,
			player.Person.FullName,
			player.Position.Abbreviation,
			venue.Name,
		}
		if err := writer.Write(row); err != nil {
			fmt.Println("Error writing record to CSV:", err)
		}
	}

	writer.Flush()
	if err := writer.Error(); err != nil {
		fmt.Println("Error flushing CSV writer:", err)
	}

	return csvContent.String()
}

type mlbPerson struct {
	Id       int    `json:"id"`
	FullName string `json:"fullName"`
}

type mlbPlayer struct {
	Person       mlbPerson   `json:"person"`
	JerseyNumber string      `json:"jerseyNumber"`
	Position     mlbPosition `json:"position"`
	Status       mlbStatus   `json:"status"`
}

type mlbPosition struct {
	Name         string `json:"name"`
	PositionType string `json:"type"`
	Abbreviation string `json:"abbreviation"`
}

type mlbRoster struct {
	Roster []mlbPlayer `json:"roster"`
}

type mlbStatus struct {
	Description string `json:"description"`
}

type mlbTeams struct {
	Teams []mlbTeam `json:"teams"`
}

type mlbTeam struct {
	Id           int    `json:"id"`
	Active       bool   `json:"active"`
	Name         string `json:"name"`
	LocationName string `json:"locationName"`
	TeamName     string `json:"teamname"`
	Venue        id     `json:"venue"`
}

type mlbVenues struct {
	Venues []mlbVenue `json:"venues"`
}

type mlbVenue struct {
	Id     int    `json:"id"`
	Name   string `json:"name"`
	Active bool   `json:"active"`
}

type id struct {
	Id int `json:"id"`
}
