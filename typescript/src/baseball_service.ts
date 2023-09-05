import axios from "axios";
import * as csv from "csv-stringify";

const HEADERS = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
};

export class BaseballService {
  constructor(private baseUrl: string = 'https://statsapi.mlb.com/') { }

  async execute(query: string): Promise<string> {
    const team = await this.fetchMlbTeam(query);
    if (!team) {
      return Promise.resolve('Not Found');
    }
    const roster = this.fetchMlbRoster(team.id);
    const venue = this.fetchMlbVenueById(team.venue.id);
    return this.printRoster(await roster, team, (await venue)!);
  }

  private async fetchMlbRoster(teamId: number): Promise<MlbRoster> {
    return axios.get<MlbRoster>(
      `${this.baseUrl}/api/v1/teams/${teamId}/roster`, { headers: HEADERS })
      .then(response => response.data)
      .catch(error => {
        throw new Error(
          `Unexpected status when looking up roster by ${teamId}: ` +
          error.response.status);
      });
  }

  private async fetchMlbTeam(query: string) {
    return isNaN(Number(query))
      ? this.fetchMlbTeamByName(query)
      : this.fetchMlbTeamById(query);
  }

  private async fetchMlbTeamById(teamId: string): Promise<MlbTeam | null> {
    return axios.get<{ teams: MlbTeam[] }>(
      `${this.baseUrl}/api/v1/teams/${teamId}`, { headers: HEADERS })
      .then(response => {
        const teams = response.data.teams;
        return teams != null && teams.length == 1 ? teams[0] : null;
      }).catch(error => {
        if (error.response.status == 404) {
          return null;
        }
        throw new Error(
          `Unexpected status when looking up team ${teamId}: ` +
          error.response.status);
      });
  }

  private async fetchMlbTeamByName(name: string): Promise<MlbTeam | null> {
    var season = new Date().getFullYear().toString();
    return axios.get<{ teams: MlbTeam[] }>(
      `${this.baseUrl}/api/v1/teams`, {
      headers: HEADERS,
      params: { season, 'sportIds': '1' },
    }).then(response => {
      const matches = (response.data.teams || [])
        .filter(team => team.active)
        .filter(team => team.name.toLowerCase().includes(name.toLowerCase()));
      return matches.length ? matches[0] : null;
    }).catch(error => {
      throw new Error(
        `Unexpected status when looking up team ${name}: ` +
        error.response.status);
    });
  }

  private async fetchMlbVenueById(venueId: number): Promise<MlbVenue | null> {
    return axios.get<{ venues: MlbVenue[] }>(
      `${this.baseUrl}/api/v1/venues/${venueId}`, { headers: HEADERS })
      .then(response => {
        const venues = (response.data.venues || [])
          .filter(venue => venue.active)
        return venues.length ? venues[0] : null;
      })
      .catch(error => {
        if (error.response.status == 404) {
          return null;
        }
        throw new Error(
          `Unexpected status when looking up venue by ${venueId}: ` +
          error.response.status);
      });
  }

  private async printRoster(roster: MlbRoster, team: MlbTeam, venue: MlbVenue): Promise<string> {
    const rows = [['Team', 'Jersey', 'Name', 'Position', 'Home Stadium']];
    roster.roster
      .forEach(player => {
        rows.push([
          team.name,
          player.jerseyNumber,
          player.person.fullName,
          player.position.abbreviation,
          venue.name,
        ]);
      });
    return new Promise((resolve, _reject) => {
      csv.stringify(rows, (_err, output) => resolve(output.trim()));
    });
  }
}

interface MlbPerson {
  id: number;
  fullName: string;
}

interface MlbPlayer {
  person: MlbPerson;
  jerseyNumber: string;
  position: MlbPosition;
  status: MlbStatus;
}

interface MlbPosition {
  name: string;
  type: string;
  abbreviation: string;
}

interface MlbRoster {
  roster: MlbPlayer[];
}

interface MlbStatus {
  description: string;
}

interface MlbTeam {
  id: number;
  active: boolean;
  name: string;
  locationName: string;
  teamName: string;
  venue: Id;
}

interface MlbVenue {
  id: number;
  name: string;
  active: boolean;
}

interface Id {
  id: number;
}
