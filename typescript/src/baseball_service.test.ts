import AxiosMockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { BaseballService } from './baseball_service';

describe('Baseball service', () => {
  let axiosMock: AxiosMockAdapter;
  let baseballService: BaseballService;

  beforeEach(() => {
    const mockDate = new Date(2020, 9, 5);
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
    baseballService = new BaseballService('http://fake');
    axiosMock = new AxiosMockAdapter(axios);
  });

  afterEach(() => {
    axiosMock.restore();
  });

  it('looks up a team by ID', async () => {
    axiosMock
      .onGet('http://fake/api/v1/teams/137')
      .reply(200, TEAM_137_JSON);

    axiosMock
      .onGet('http://fake/api/v1/teams/137/roster')
      .reply(200, TEAM_137_ROSTER_JSON);

    axiosMock
      .onGet('http://fake/api/v1/venues/2395')
      .reply(200, VENUE_2395_JSON);

    const result = await baseballService.execute('137');
    expect(result).toEqual(EXPECTED_GIANTS);
  });

  it('prints not found when looking up by invalid ID', async () => {
    axiosMock
      .onGet('http://fake/api/v1/teams/137')
      .reply(404, '');

    const result = await baseballService.execute('137');
    expect(result).toEqual('Not Found');
  });

  it('looks up a team by name', async () => {
    axiosMock
      .onGet(
        'http://fake/api/v1/teams',
        { params: { season: '2020', sportIds: '1' } })
      .reply(200, TEAMS_ALLMLB_JSON);

    axiosMock
      .onGet('http://fake/api/v1/teams/137/roster')
      .reply(200, TEAM_137_ROSTER_JSON);

    axiosMock
      .onGet('http://fake/api/v1/venues/2395')
      .reply(200, VENUE_2395_JSON);

    const result = await baseballService.execute('giants');
    expect(result).toEqual(EXPECTED_GIANTS);
  });

  it('prints not found when looking up by invalid name', async () => {
    axiosMock
      .onGet(
        'http://fake/api/v1/teams',
        { params: { season: '2020', sportIds: '1' } })
      .reply(200, TEAMS_ALLMLB_JSON);

    const result = await baseballService.execute('knicks');
    expect(result).toEqual('Not Found');
  });
});

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
San Francisco Giants,41,Wilmer Flores,1B,Oracle Park`;

const TEAM_137_JSON = `{
  "copyright": "Copyright 2023 MLB Advanced Media, L.P.  Use of any content on this page acknowledges agreement to the terms posted here http://gdx.mlb.com/components/copyright.txt",
  "teams": [
    {
      "springLeague": {
        "id": 114,
        "name": "Cactus League",
        "link": "/api/v1/league/114",
        "abbreviation": "CL"
      },
      "allStarStatus": "N",
      "id": 137,
      "name": "San Francisco Giants",
      "link": "/api/v1/teams/137",
      "season": 2023,
      "venue": {
        "id": 2395,
        "name": "Oracle Park",
        "link": "/api/v1/venues/2395"
      },
      "springVenue": {
        "id": 2532,
        "link": "/api/v1/venues/2532"
      },
      "teamCode": "sfn",
      "fileCode": "sf",
      "abbreviation": "SF",
      "teamName": "Giants",
      "locationName": "San Francisco",
      "firstYearOfPlay": "1883",
      "league": {
        "id": 104,
        "name": "National League",
        "link": "/api/v1/league/104"
      },
      "division": {
        "id": 203,
        "name": "National League West",
        "link": "/api/v1/divisions/203"
      },
      "sport": {
        "id": 1,
        "link": "/api/v1/sports/1",
        "name": "Major League Baseball"
      },
      "shortName": "San Francisco",
      "franchiseName": "San Francisco",
      "clubName": "Giants",
      "active": true
    }
  ]
}`;

const TEAMS_ALLMLB_JSON = `
{
  "copyright": "Copyright 2023 MLB Advanced Media, L.P.  Use of any content on this page acknowledges agreement to the terms posted here http://gdx.mlb.com/components/copyright.txt",
  "teams": [
    {
      "springLeague": {
        "id": 114,
        "name": "Cactus League",
        "link": "/api/v1/league/114",
        "abbreviation": "CL"
      },
      "allStarStatus": "N",
      "id": 133,
      "name": "Oakland Athletics",
      "link": "/api/v1/teams/133",
      "season": 2023,
      "venue": {
        "id": 10,
        "name": "Oakland Coliseum",
        "link": "/api/v1/venues/10"
      },
      "springVenue": {
        "id": 2507,
        "link": "/api/v1/venues/2507"
      },
      "teamCode": "oak",
      "fileCode": "oak",
      "abbreviation": "OAK",
      "teamName": "Athletics",
      "locationName": "Oakland",
      "firstYearOfPlay": "1901",
      "league": {
        "id": 103,
        "name": "American League",
        "link": "/api/v1/league/103"
      },
      "division": {
        "id": 200,
        "name": "American League West",
        "link": "/api/v1/divisions/200"
      },
      "sport": {
        "id": 1,
        "link": "/api/v1/sports/1",
        "name": "Major League Baseball"
      },
      "shortName": "Oakland",
      "franchiseName": "Oakland",
      "clubName": "Athletics",
      "active": true
    },
    {
      "springLeague": {
        "id": 115,
        "name": "Grapefruit League",
        "link": "/api/v1/league/115",
        "abbreviation": "GL"
      },
      "allStarStatus": "N",
      "id": 134,
      "name": "Pittsburgh Pirates",
      "link": "/api/v1/teams/134",
      "season": 2023,
      "venue": {
        "id": 31,
        "name": "PNC Park",
        "link": "/api/v1/venues/31"
      },
      "springVenue": {
        "id": 2526,
        "link": "/api/v1/venues/2526"
      },
      "teamCode": "pit",
      "fileCode": "pit",
      "abbreviation": "PIT",
      "teamName": "Pirates",
      "locationName": "Pittsburgh",
      "firstYearOfPlay": "1882",
      "league": {
        "id": 104,
        "name": "National League",
        "link": "/api/v1/league/104"
      },
      "division": {
        "id": 205,
        "name": "National League Central",
        "link": "/api/v1/divisions/205"
      },
      "sport": {
        "id": 1,
        "link": "/api/v1/sports/1",
        "name": "Major League Baseball"
      },
      "shortName": "Pittsburgh",
      "franchiseName": "Pittsburgh",
      "clubName": "Pirates",
      "active": true
    },
    {
      "springLeague": {
        "id": 114,
        "name": "Cactus League",
        "link": "/api/v1/league/114",
        "abbreviation": "CL"
      },
      "allStarStatus": "N",
      "id": 135,
      "name": "San Diego Padres",
      "link": "/api/v1/teams/135",
      "season": 2023,
      "venue": {
        "id": 2680,
        "name": "Petco Park",
        "link": "/api/v1/venues/2680"
      },
      "springVenue": {
        "id": 2530,
        "link": "/api/v1/venues/2530"
      },
      "teamCode": "sdn",
      "fileCode": "sd",
      "abbreviation": "SD",
      "teamName": "Padres",
      "locationName": "San Diego",
      "firstYearOfPlay": "1968",
      "league": {
        "id": 104,
        "name": "National League",
        "link": "/api/v1/league/104"
      },
      "division": {
        "id": 203,
        "name": "National League West",
        "link": "/api/v1/divisions/203"
      },
      "sport": {
        "id": 1,
        "link": "/api/v1/sports/1",
        "name": "Major League Baseball"
      },
      "shortName": "San Diego",
      "franchiseName": "San Diego",
      "clubName": "Padres",
      "active": true
    },
    {
      "springLeague": {
        "id": 114,
        "name": "Cactus League",
        "link": "/api/v1/league/114",
        "abbreviation": "CL"
      },
      "allStarStatus": "N",
      "id": 136,
      "name": "Seattle Mariners",
      "link": "/api/v1/teams/136",
      "season": 2023,
      "venue": {
        "id": 680,
        "name": "T-Mobile Park",
        "link": "/api/v1/venues/680"
      },
      "springVenue": {
        "id": 2530,
        "link": "/api/v1/venues/2530"
      },
      "teamCode": "sea",
      "fileCode": "sea",
      "abbreviation": "SEA",
      "teamName": "Mariners",
      "locationName": "Seattle",
      "firstYearOfPlay": "1977",
      "league": {
        "id": 103,
        "name": "American League",
        "link": "/api/v1/league/103"
      },
      "division": {
        "id": 200,
        "name": "American League West",
        "link": "/api/v1/divisions/200"
      },
      "sport": {
        "id": 1,
        "link": "/api/v1/sports/1",
        "name": "Major League Baseball"
      },
      "shortName": "Seattle",
      "franchiseName": "Seattle",
      "clubName": "Mariners",
      "active": true
    },
    {
      "springLeague": {
        "id": 114,
        "name": "Cactus League",
        "link": "/api/v1/league/114",
        "abbreviation": "CL"
      },
      "allStarStatus": "N",
      "id": 137,
      "name": "San Francisco Giants",
      "link": "/api/v1/teams/137",
      "season": 2023,
      "venue": {
        "id": 2395,
        "name": "Oracle Park",
        "link": "/api/v1/venues/2395"
      },
      "springVenue": {
        "id": 2532,
        "link": "/api/v1/venues/2532"
      },
      "teamCode": "sfn",
      "fileCode": "sf",
      "abbreviation": "SF",
      "teamName": "Giants",
      "locationName": "San Francisco",
      "firstYearOfPlay": "1883",
      "league": {
        "id": 104,
        "name": "National League",
        "link": "/api/v1/league/104"
      },
      "division": {
        "id": 203,
        "name": "National League West",
        "link": "/api/v1/divisions/203"
      },
      "sport": {
        "id": 1,
        "link": "/api/v1/sports/1",
        "name": "Major League Baseball"
      },
      "shortName": "San Francisco",
      "franchiseName": "San Francisco",
      "clubName": "Giants",
      "active": true
    },
    {
      "springLeague": {
        "id": 115,
        "name": "Grapefruit League",
        "link": "/api/v1/league/115",
        "abbreviation": "GL"
      },
      "allStarStatus": "N",
      "id": 138,
      "name": "St. Louis Cardinals",
      "link": "/api/v1/teams/138",
      "season": 2023,
      "venue": {
        "id": 2889,
        "name": "Busch Stadium",
        "link": "/api/v1/venues/2889"
      },
      "springVenue": {
        "id": 2520,
        "link": "/api/v1/venues/2520"
      },
      "teamCode": "sln",
      "fileCode": "stl",
      "abbreviation": "STL",
      "teamName": "Cardinals",
      "locationName": "St. Louis",
      "firstYearOfPlay": "1892",
      "league": {
        "id": 104,
        "name": "National League",
        "link": "/api/v1/league/104"
      },
      "division": {
        "id": 205,
        "name": "National League Central",
        "link": "/api/v1/divisions/205"
      },
      "sport": {
        "id": 1,
        "link": "/api/v1/sports/1",
        "name": "Major League Baseball"
      },
      "shortName": "St. Louis",
      "franchiseName": "St. Louis",
      "clubName": "Cardinals",
      "active": true
    },
    {
      "springLeague": {
        "id": 115,
        "name": "Grapefruit League",
        "link": "/api/v1/league/115",
        "abbreviation": "GL"
      },
      "allStarStatus": "N",
      "id": 139,
      "name": "Tampa Bay Rays",
      "link": "/api/v1/teams/139",
      "season": 2023,
      "venue": {
        "id": 12,
        "name": "Tropicana Field",
        "link": "/api/v1/venues/12"
      },
      "springVenue": {
        "id": 2534,
        "link": "/api/v1/venues/2534"
      },
      "teamCode": "tba",
      "fileCode": "tb",
      "abbreviation": "TB",
      "teamName": "Rays",
      "locationName": "St. Petersburg",
      "firstYearOfPlay": "1996",
      "league": {
        "id": 103,
        "name": "American League",
        "link": "/api/v1/league/103"
      },
      "division": {
        "id": 201,
        "name": "American League East",
        "link": "/api/v1/divisions/201"
      },
      "sport": {
        "id": 1,
        "link": "/api/v1/sports/1",
        "name": "Major League Baseball"
      },
      "shortName": "Tampa Bay",
      "franchiseName": "Tampa Bay",
      "clubName": "Rays",
      "active": true
    },
    {
      "springLeague": {
        "id": 114,
        "name": "Cactus League",
        "link": "/api/v1/league/114",
        "abbreviation": "CL"
      },
      "allStarStatus": "N",
      "id": 140,
      "name": "Texas Rangers",
      "link": "/api/v1/teams/140",
      "season": 2023,
      "venue": {
        "id": 5325,
        "name": "Globe Life Field",
        "link": "/api/v1/venues/5325"
      },
      "springVenue": {
        "id": 2603,
        "link": "/api/v1/venues/2603"
      },
      "teamCode": "tex",
      "fileCode": "tex",
      "abbreviation": "TEX",
      "teamName": "Rangers",
      "locationName": "Arlington",
      "firstYearOfPlay": "1961",
      "league": {
        "id": 103,
        "name": "American League",
        "link": "/api/v1/league/103"
      },
      "division": {
        "id": 200,
        "name": "American League West",
        "link": "/api/v1/divisions/200"
      },
      "sport": {
        "id": 1,
        "link": "/api/v1/sports/1",
        "name": "Major League Baseball"
      },
      "shortName": "Texas",
      "franchiseName": "Texas",
      "clubName": "Rangers",
      "active": true
    },
    {
      "springLeague": {
        "id": 115,
        "name": "Grapefruit League",
        "link": "/api/v1/league/115",
        "abbreviation": "GL"
      },
      "allStarStatus": "N",
      "id": 141,
      "name": "Toronto Blue Jays",
      "link": "/api/v1/teams/141",
      "season": 2023,
      "venue": {
        "id": 14,
        "name": "Rogers Centre",
        "link": "/api/v1/venues/14"
      },
      "springVenue": {
        "id": 2536,
        "link": "/api/v1/venues/2536"
      },
      "teamCode": "tor",
      "fileCode": "tor",
      "abbreviation": "TOR",
      "teamName": "Blue Jays",
      "locationName": "Toronto",
      "firstYearOfPlay": "1977",
      "league": {
        "id": 103,
        "name": "American League",
        "link": "/api/v1/league/103"
      },
      "division": {
        "id": 201,
        "name": "American League East",
        "link": "/api/v1/divisions/201"
      },
      "sport": {
        "id": 1,
        "link": "/api/v1/sports/1",
        "name": "Major League Baseball"
      },
      "shortName": "Toronto",
      "franchiseName": "Toronto",
      "clubName": "Blue Jays",
      "active": true
    },
    {
      "springLeague": {
        "id": 115,
        "name": "Grapefruit League",
        "link": "/api/v1/league/115",
        "abbreviation": "GL"
      },
      "allStarStatus": "N",
      "id": 142,
      "name": "Minnesota Twins",
      "link": "/api/v1/teams/142",
      "season": 2023,
      "venue": {
        "id": 3312,
        "name": "Target Field",
        "link": "/api/v1/venues/3312"
      },
      "springVenue": {
        "id": 2862,
        "link": "/api/v1/venues/2862"
      },
      "teamCode": "min",
      "fileCode": "min",
      "abbreviation": "MIN",
      "teamName": "Twins",
      "locationName": "Minneapolis",
      "firstYearOfPlay": "1901",
      "league": {
        "id": 103,
        "name": "American League",
        "link": "/api/v1/league/103"
      },
      "division": {
        "id": 202,
        "name": "American League Central",
        "link": "/api/v1/divisions/202"
      },
      "sport": {
        "id": 1,
        "link": "/api/v1/sports/1",
        "name": "Major League Baseball"
      },
      "shortName": "Minnesota",
      "franchiseName": "Minnesota",
      "clubName": "Twins",
      "active": true
    },
    {
      "springLeague": {
        "id": 115,
        "name": "Grapefruit League",
        "link": "/api/v1/league/115",
        "abbreviation": "GL"
      },
      "allStarStatus": "N",
      "id": 143,
      "name": "Philadelphia Phillies",
      "link": "/api/v1/teams/143",
      "season": 2023,
      "venue": {
        "id": 2681,
        "name": "Citizens Bank Park",
        "link": "/api/v1/venues/2681"
      },
      "springVenue": {
        "id": 2700,
        "link": "/api/v1/venues/2700"
      },
      "teamCode": "phi",
      "fileCode": "phi",
      "abbreviation": "PHI",
      "teamName": "Phillies",
      "locationName": "Philadelphia",
      "firstYearOfPlay": "1883",
      "league": {
        "id": 104,
        "name": "National League",
        "link": "/api/v1/league/104"
      },
      "division": {
        "id": 204,
        "name": "National League East",
        "link": "/api/v1/divisions/204"
      },
      "sport": {
        "id": 1,
        "link": "/api/v1/sports/1",
        "name": "Major League Baseball"
      },
      "shortName": "Philadelphia",
      "franchiseName": "Philadelphia",
      "clubName": "Phillies",
      "active": true
    },
    {
      "springLeague": {
        "id": 115,
        "name": "Grapefruit League",
        "link": "/api/v1/league/115",
        "abbreviation": "GL"
      },
      "allStarStatus": "N",
      "id": 144,
      "name": "Atlanta Braves",
      "link": "/api/v1/teams/144",
      "season": 2023,
      "venue": {
        "id": 4705,
        "name": "Truist Park",
        "link": "/api/v1/venues/4705"
      },
      "springVenue": {
        "id": 5380,
        "link": "/api/v1/venues/5380"
      },
      "teamCode": "atl",
      "fileCode": "atl",
      "abbreviation": "ATL",
      "teamName": "Braves",
      "locationName": "Atlanta",
      "firstYearOfPlay": "1871",
      "league": {
        "id": 104,
        "name": "National League",
        "link": "/api/v1/league/104"
      },
      "division": {
        "id": 204,
        "name": "National League East",
        "link": "/api/v1/divisions/204"
      },
      "sport": {
        "id": 1,
        "link": "/api/v1/sports/1",
        "name": "Major League Baseball"
      },
      "shortName": "Atlanta",
      "franchiseName": "Atlanta",
      "clubName": "Braves",
      "active": true
    },
    {
      "springLeague": {
        "id": 114,
        "name": "Cactus League",
        "link": "/api/v1/league/114",
        "abbreviation": "CL"
      },
      "allStarStatus": "N",
      "id": 145,
      "name": "Chicago White Sox",
      "link": "/api/v1/teams/145",
      "season": 2023,
      "venue": {
        "id": 4,
        "name": "Guaranteed Rate Field",
        "link": "/api/v1/venues/4"
      },
      "springVenue": {
        "id": 3809,
        "link": "/api/v1/venues/3809"
      },
      "teamCode": "cha",
      "fileCode": "cws",
      "abbreviation": "CWS",
      "teamName": "White Sox",
      "locationName": "Chicago",
      "firstYearOfPlay": "1901",
      "league": {
        "id": 103,
        "name": "American League",
        "link": "/api/v1/league/103"
      },
      "division": {
        "id": 202,
        "name": "American League Central",
        "link": "/api/v1/divisions/202"
      },
      "sport": {
        "id": 1,
        "link": "/api/v1/sports/1",
        "name": "Major League Baseball"
      },
      "shortName": "Chi White Sox",
      "franchiseName": "Chicago",
      "clubName": "White Sox",
      "active": true
    },
    {
      "springLeague": {
        "id": 115,
        "name": "Grapefruit League",
        "link": "/api/v1/league/115",
        "abbreviation": "GL"
      },
      "allStarStatus": "N",
      "id": 146,
      "name": "Miami Marlins",
      "link": "/api/v1/teams/146",
      "season": 2023,
      "venue": {
        "id": 4169,
        "name": "loanDepot park",
        "link": "/api/v1/venues/4169"
      },
      "springVenue": {
        "id": 2520,
        "link": "/api/v1/venues/2520"
      },
      "teamCode": "mia",
      "fileCode": "mia",
      "abbreviation": "MIA",
      "teamName": "Marlins",
      "locationName": "Miami",
      "firstYearOfPlay": "1991",
      "league": {
        "id": 104,
        "name": "National League",
        "link": "/api/v1/league/104"
      },
      "division": {
        "id": 204,
        "name": "National League East",
        "link": "/api/v1/divisions/204"
      },
      "sport": {
        "id": 1,
        "link": "/api/v1/sports/1",
        "name": "Major League Baseball"
      },
      "shortName": "Miami",
      "franchiseName": "Miami",
      "clubName": "Marlins",
      "active": true
    },
    {
      "springLeague": {
        "id": 115,
        "name": "Grapefruit League",
        "link": "/api/v1/league/115",
        "abbreviation": "GL"
      },
      "allStarStatus": "N",
      "id": 147,
      "name": "New York Yankees",
      "link": "/api/v1/teams/147",
      "season": 2023,
      "venue": {
        "id": 3313,
        "name": "Yankee Stadium",
        "link": "/api/v1/venues/3313"
      },
      "springVenue": {
        "id": 2523,
        "link": "/api/v1/venues/2523"
      },
      "teamCode": "nya",
      "fileCode": "nyy",
      "abbreviation": "NYY",
      "teamName": "Yankees",
      "locationName": "Bronx",
      "firstYearOfPlay": "1903",
      "league": {
        "id": 103,
        "name": "American League",
        "link": "/api/v1/league/103"
      },
      "division": {
        "id": 201,
        "name": "American League East",
        "link": "/api/v1/divisions/201"
      },
      "sport": {
        "id": 1,
        "link": "/api/v1/sports/1",
        "name": "Major League Baseball"
      },
      "shortName": "NY Yankees",
      "franchiseName": "New York",
      "clubName": "Yankees",
      "active": true
    },
    {
      "springLeague": {
        "id": 114,
        "name": "Cactus League",
        "link": "/api/v1/league/114",
        "abbreviation": "CL"
      },
      "allStarStatus": "N",
      "id": 158,
      "name": "Milwaukee Brewers",
      "link": "/api/v1/teams/158",
      "season": 2023,
      "venue": {
        "id": 32,
        "name": "American Family Field",
        "link": "/api/v1/venues/32"
      },
      "springVenue": {
        "id": 2518,
        "link": "/api/v1/venues/2518"
      },
      "teamCode": "mil",
      "fileCode": "mil",
      "abbreviation": "MIL",
      "teamName": "Brewers",
      "locationName": "Milwaukee",
      "firstYearOfPlay": "1968",
      "league": {
        "id": 104,
        "name": "National League",
        "link": "/api/v1/league/104"
      },
      "division": {
        "id": 205,
        "name": "National League Central",
        "link": "/api/v1/divisions/205"
      },
      "sport": {
        "id": 1,
        "link": "/api/v1/sports/1",
        "name": "Major League Baseball"
      },
      "shortName": "Milwaukee",
      "franchiseName": "Milwaukee",
      "clubName": "Brewers",
      "active": true
    },
    {
      "springLeague": {
        "id": 114,
        "name": "Cactus League",
        "link": "/api/v1/league/114",
        "abbreviation": "CL"
      },
      "allStarStatus": "N",
      "id": 108,
      "name": "Los Angeles Angels",
      "link": "/api/v1/teams/108",
      "season": 2023,
      "venue": {
        "id": 1,
        "name": "Angel Stadium",
        "link": "/api/v1/venues/1"
      },
      "springVenue": {
        "id": 2500,
        "link": "/api/v1/venues/2500"
      },
      "teamCode": "ana",
      "fileCode": "ana",
      "abbreviation": "LAA",
      "teamName": "Angels",
      "locationName": "Anaheim",
      "firstYearOfPlay": "1961",
      "league": {
        "id": 103,
        "name": "American League",
        "link": "/api/v1/league/103"
      },
      "division": {
        "id": 200,
        "name": "American League West",
        "link": "/api/v1/divisions/200"
      },
      "sport": {
        "id": 1,
        "link": "/api/v1/sports/1",
        "name": "Major League Baseball"
      },
      "shortName": "LA Angels",
      "franchiseName": "Los Angeles",
      "clubName": "Angels",
      "active": true
    },
    {
      "springLeague": {
        "id": 114,
        "name": "Cactus League",
        "link": "/api/v1/league/114",
        "abbreviation": "CL"
      },
      "allStarStatus": "N",
      "id": 109,
      "name": "Arizona Diamondbacks",
      "link": "/api/v1/teams/109",
      "season": 2023,
      "venue": {
        "id": 15,
        "name": "Chase Field",
        "link": "/api/v1/venues/15"
      },
      "springVenue": {
        "id": 4249,
        "link": "/api/v1/venues/4249"
      },
      "teamCode": "ari",
      "fileCode": "ari",
      "abbreviation": "AZ",
      "teamName": "D-backs",
      "locationName": "Phoenix",
      "firstYearOfPlay": "1996",
      "league": {
        "id": 104,
        "name": "National League",
        "link": "/api/v1/league/104"
      },
      "division": {
        "id": 203,
        "name": "National League West",
        "link": "/api/v1/divisions/203"
      },
      "sport": {
        "id": 1,
        "link": "/api/v1/sports/1",
        "name": "Major League Baseball"
      },
      "shortName": "Arizona",
      "franchiseName": "Arizona",
      "clubName": "Diamondbacks",
      "active": true
    },
    {
      "springLeague": {
        "id": 115,
        "name": "Grapefruit League",
        "link": "/api/v1/league/115",
        "abbreviation": "GL"
      },
      "allStarStatus": "N",
      "id": 110,
      "name": "Baltimore Orioles",
      "link": "/api/v1/teams/110",
      "season": 2023,
      "venue": {
        "id": 2,
        "name": "Oriole Park at Camden Yards",
        "link": "/api/v1/venues/2"
      },
      "springVenue": {
        "id": 2508,
        "link": "/api/v1/venues/2508"
      },
      "teamCode": "bal",
      "fileCode": "bal",
      "abbreviation": "BAL",
      "teamName": "Orioles",
      "locationName": "Baltimore",
      "firstYearOfPlay": "1901",
      "league": {
        "id": 103,
        "name": "American League",
        "link": "/api/v1/league/103"
      },
      "division": {
        "id": 201,
        "name": "American League East",
        "link": "/api/v1/divisions/201"
      },
      "sport": {
        "id": 1,
        "link": "/api/v1/sports/1",
        "name": "Major League Baseball"
      },
      "shortName": "Baltimore",
      "franchiseName": "Baltimore",
      "clubName": "Orioles",
      "active": true
    },
    {
      "springLeague": {
        "id": 115,
        "name": "Grapefruit League",
        "link": "/api/v1/league/115",
        "abbreviation": "GL"
      },
      "allStarStatus": "N",
      "id": 111,
      "name": "Boston Red Sox",
      "link": "/api/v1/teams/111",
      "season": 2023,
      "venue": {
        "id": 3,
        "name": "Fenway Park",
        "link": "/api/v1/venues/3"
      },
      "springVenue": {
        "id": 4309,
        "link": "/api/v1/venues/4309"
      },
      "teamCode": "bos",
      "fileCode": "bos",
      "abbreviation": "BOS",
      "teamName": "Red Sox",
      "locationName": "Boston",
      "firstYearOfPlay": "1901",
      "league": {
        "id": 103,
        "name": "American League",
        "link": "/api/v1/league/103"
      },
      "division": {
        "id": 201,
        "name": "American League East",
        "link": "/api/v1/divisions/201"
      },
      "sport": {
        "id": 1,
        "link": "/api/v1/sports/1",
        "name": "Major League Baseball"
      },
      "shortName": "Boston",
      "franchiseName": "Boston",
      "clubName": "Red Sox",
      "active": true
    },
    {
      "springLeague": {
        "id": 114,
        "name": "Cactus League",
        "link": "/api/v1/league/114",
        "abbreviation": "CL"
      },
      "allStarStatus": "N",
      "id": 112,
      "name": "Chicago Cubs",
      "link": "/api/v1/teams/112",
      "season": 2023,
      "venue": {
        "id": 17,
        "name": "Wrigley Field",
        "link": "/api/v1/venues/17"
      },
      "springVenue": {
        "id": 4629,
        "link": "/api/v1/venues/4629"
      },
      "teamCode": "chn",
      "fileCode": "chc",
      "abbreviation": "CHC",
      "teamName": "Cubs",
      "locationName": "Chicago",
      "firstYearOfPlay": "1874",
      "league": {
        "id": 104,
        "name": "National League",
        "link": "/api/v1/league/104"
      },
      "division": {
        "id": 205,
        "name": "National League Central",
        "link": "/api/v1/divisions/205"
      },
      "sport": {
        "id": 1,
        "link": "/api/v1/sports/1",
        "name": "Major League Baseball"
      },
      "shortName": "Chi Cubs",
      "franchiseName": "Chicago",
      "clubName": "Cubs",
      "active": true
    },
    {
      "springLeague": {
        "id": 114,
        "name": "Cactus League",
        "link": "/api/v1/league/114",
        "abbreviation": "CL"
      },
      "allStarStatus": "N",
      "id": 113,
      "name": "Cincinnati Reds",
      "link": "/api/v1/teams/113",
      "season": 2023,
      "venue": {
        "id": 2602,
        "name": "Great American Ball Park",
        "link": "/api/v1/venues/2602"
      },
      "springVenue": {
        "id": 3834,
        "link": "/api/v1/venues/3834"
      },
      "teamCode": "cin",
      "fileCode": "cin",
      "abbreviation": "CIN",
      "teamName": "Reds",
      "locationName": "Cincinnati",
      "firstYearOfPlay": "1882",
      "league": {
        "id": 104,
        "name": "National League",
        "link": "/api/v1/league/104"
      },
      "division": {
        "id": 205,
        "name": "National League Central",
        "link": "/api/v1/divisions/205"
      },
      "sport": {
        "id": 1,
        "link": "/api/v1/sports/1",
        "name": "Major League Baseball"
      },
      "shortName": "Cincinnati",
      "franchiseName": "Cincinnati",
      "clubName": "Reds",
      "active": true
    },
    {
      "springLeague": {
        "id": 114,
        "name": "Cactus League",
        "link": "/api/v1/league/114",
        "abbreviation": "CL"
      },
      "allStarStatus": "N",
      "id": 114,
      "name": "Cleveland Guardians",
      "link": "/api/v1/teams/114",
      "season": 2023,
      "venue": {
        "id": 5,
        "name": "Progressive Field",
        "link": "/api/v1/venues/5"
      },
      "springVenue": {
        "id": 3834,
        "link": "/api/v1/venues/3834"
      },
      "teamCode": "cle",
      "fileCode": "cle",
      "abbreviation": "CLE",
      "teamName": "Guardians",
      "locationName": "Cleveland",
      "firstYearOfPlay": "1901",
      "league": {
        "id": 103,
        "name": "American League",
        "link": "/api/v1/league/103"
      },
      "division": {
        "id": 202,
        "name": "American League Central",
        "link": "/api/v1/divisions/202"
      },
      "sport": {
        "id": 1,
        "link": "/api/v1/sports/1",
        "name": "Major League Baseball"
      },
      "shortName": "Cleveland",
      "franchiseName": "Cleveland",
      "clubName": "Guardians",
      "active": true
    },
    {
      "springLeague": {
        "id": 114,
        "name": "Cactus League",
        "link": "/api/v1/league/114",
        "abbreviation": "CL"
      },
      "allStarStatus": "N",
      "id": 115,
      "name": "Colorado Rockies",
      "link": "/api/v1/teams/115",
      "season": 2023,
      "venue": {
        "id": 19,
        "name": "Coors Field",
        "link": "/api/v1/venues/19"
      },
      "springVenue": {
        "id": 4249,
        "link": "/api/v1/venues/4249"
      },
      "teamCode": "col",
      "fileCode": "col",
      "abbreviation": "COL",
      "teamName": "Rockies",
      "locationName": "Denver",
      "firstYearOfPlay": "1992",
      "league": {
        "id": 104,
        "name": "National League",
        "link": "/api/v1/league/104"
      },
      "division": {
        "id": 203,
        "name": "National League West",
        "link": "/api/v1/divisions/203"
      },
      "sport": {
        "id": 1,
        "link": "/api/v1/sports/1",
        "name": "Major League Baseball"
      },
      "shortName": "Colorado",
      "franchiseName": "Colorado",
      "clubName": "Rockies",
      "active": true
    },
    {
      "springLeague": {
        "id": 115,
        "name": "Grapefruit League",
        "link": "/api/v1/league/115",
        "abbreviation": "GL"
      },
      "allStarStatus": "N",
      "id": 116,
      "name": "Detroit Tigers",
      "link": "/api/v1/teams/116",
      "season": 2023,
      "venue": {
        "id": 2394,
        "name": "Comerica Park",
        "link": "/api/v1/venues/2394"
      },
      "springVenue": {
        "id": 2511,
        "link": "/api/v1/venues/2511"
      },
      "teamCode": "det",
      "fileCode": "det",
      "abbreviation": "DET",
      "teamName": "Tigers",
      "locationName": "Detroit",
      "firstYearOfPlay": "1901",
      "league": {
        "id": 103,
        "name": "American League",
        "link": "/api/v1/league/103"
      },
      "division": {
        "id": 202,
        "name": "American League Central",
        "link": "/api/v1/divisions/202"
      },
      "sport": {
        "id": 1,
        "link": "/api/v1/sports/1",
        "name": "Major League Baseball"
      },
      "shortName": "Detroit",
      "franchiseName": "Detroit",
      "clubName": "Tigers",
      "active": true
    },
    {
      "springLeague": {
        "id": 115,
        "name": "Grapefruit League",
        "link": "/api/v1/league/115",
        "abbreviation": "GL"
      },
      "allStarStatus": "N",
      "id": 117,
      "name": "Houston Astros",
      "link": "/api/v1/teams/117",
      "season": 2023,
      "venue": {
        "id": 2392,
        "name": "Minute Maid Park",
        "link": "/api/v1/venues/2392"
      },
      "springVenue": {
        "id": 5000,
        "link": "/api/v1/venues/5000"
      },
      "teamCode": "hou",
      "fileCode": "hou",
      "abbreviation": "HOU",
      "teamName": "Astros",
      "locationName": "Houston",
      "firstYearOfPlay": "1962",
      "league": {
        "id": 103,
        "name": "American League",
        "link": "/api/v1/league/103"
      },
      "division": {
        "id": 200,
        "name": "American League West",
        "link": "/api/v1/divisions/200"
      },
      "sport": {
        "id": 1,
        "link": "/api/v1/sports/1",
        "name": "Major League Baseball"
      },
      "shortName": "Houston",
      "franchiseName": "Houston",
      "clubName": "Astros",
      "active": true
    },
    {
      "springLeague": {
        "id": 114,
        "name": "Cactus League",
        "link": "/api/v1/league/114",
        "abbreviation": "CL"
      },
      "allStarStatus": "N",
      "id": 118,
      "name": "Kansas City Royals",
      "link": "/api/v1/teams/118",
      "season": 2023,
      "venue": {
        "id": 7,
        "name": "Kauffman Stadium",
        "link": "/api/v1/venues/7"
      },
      "springVenue": {
        "id": 2603,
        "link": "/api/v1/venues/2603"
      },
      "teamCode": "kca",
      "fileCode": "kc",
      "abbreviation": "KC",
      "teamName": "Royals",
      "locationName": "Kansas City",
      "firstYearOfPlay": "1968",
      "league": {
        "id": 103,
        "name": "American League",
        "link": "/api/v1/league/103"
      },
      "division": {
        "id": 202,
        "name": "American League Central",
        "link": "/api/v1/divisions/202"
      },
      "sport": {
        "id": 1,
        "link": "/api/v1/sports/1",
        "name": "Major League Baseball"
      },
      "shortName": "Kansas City",
      "franchiseName": "Kansas City",
      "clubName": "Royals",
      "active": true
    },
    {
      "springLeague": {
        "id": 114,
        "name": "Cactus League",
        "link": "/api/v1/league/114",
        "abbreviation": "CL"
      },
      "allStarStatus": "N",
      "id": 119,
      "name": "Los Angeles Dodgers",
      "link": "/api/v1/teams/119",
      "season": 2023,
      "venue": {
        "id": 22,
        "name": "Dodger Stadium",
        "link": "/api/v1/venues/22"
      },
      "springVenue": {
        "id": 3809,
        "link": "/api/v1/venues/3809"
      },
      "teamCode": "lan",
      "fileCode": "la",
      "abbreviation": "LAD",
      "teamName": "Dodgers",
      "locationName": "Los Angeles",
      "firstYearOfPlay": "1884",
      "league": {
        "id": 104,
        "name": "National League",
        "link": "/api/v1/league/104"
      },
      "division": {
        "id": 203,
        "name": "National League West",
        "link": "/api/v1/divisions/203"
      },
      "sport": {
        "id": 1,
        "link": "/api/v1/sports/1",
        "name": "Major League Baseball"
      },
      "shortName": "LA Dodgers",
      "franchiseName": "Los Angeles",
      "clubName": "Dodgers",
      "active": true
    },
    {
      "springLeague": {
        "id": 115,
        "name": "Grapefruit League",
        "link": "/api/v1/league/115",
        "abbreviation": "GL"
      },
      "allStarStatus": "N",
      "id": 120,
      "name": "Washington Nationals",
      "link": "/api/v1/teams/120",
      "season": 2023,
      "venue": {
        "id": 3309,
        "name": "Nationals Park",
        "link": "/api/v1/venues/3309"
      },
      "springVenue": {
        "id": 5000,
        "link": "/api/v1/venues/5000"
      },
      "teamCode": "was",
      "fileCode": "was",
      "abbreviation": "WSH",
      "teamName": "Nationals",
      "locationName": "Washington",
      "firstYearOfPlay": "1968",
      "league": {
        "id": 104,
        "name": "National League",
        "link": "/api/v1/league/104"
      },
      "division": {
        "id": 204,
        "name": "National League East",
        "link": "/api/v1/divisions/204"
      },
      "sport": {
        "id": 1,
        "link": "/api/v1/sports/1",
        "name": "Major League Baseball"
      },
      "shortName": "Washington",
      "franchiseName": "Washington",
      "clubName": "Nationals",
      "active": true
    },
    {
      "springLeague": {
        "id": 115,
        "name": "Grapefruit League",
        "link": "/api/v1/league/115",
        "abbreviation": "GL"
      },
      "allStarStatus": "N",
      "id": 121,
      "name": "New York Mets",
      "link": "/api/v1/teams/121",
      "season": 2023,
      "venue": {
        "id": 3289,
        "name": "Citi Field",
        "link": "/api/v1/venues/3289"
      },
      "springVenue": {
        "id": 2856,
        "link": "/api/v1/venues/2856"
      },
      "teamCode": "nyn",
      "fileCode": "nym",
      "abbreviation": "NYM",
      "teamName": "Mets",
      "locationName": "Flushing",
      "firstYearOfPlay": "1962",
      "league": {
        "id": 104,
        "name": "National League",
        "link": "/api/v1/league/104"
      },
      "division": {
        "id": 204,
        "name": "National League East",
        "link": "/api/v1/divisions/204"
      },
      "sport": {
        "id": 1,
        "link": "/api/v1/sports/1",
        "name": "Major League Baseball"
      },
      "shortName": "NY Mets",
      "franchiseName": "New York",
      "clubName": "Mets",
      "active": true
    }
  ]
}`;

const TEAM_137_ROSTER_JSON = `{
  "copyright": "Copyright 2023 MLB Advanced Media, L.P.  Use of any content on this page acknowledges agreement to the terms posted here http://gdx.mlb.com/components/copyright.txt",
  "roster": [
    {
      "person": {
        "id": 502171,
        "fullName": "Alex Cobb",
        "link": "/api/v1/people/502171"
      },
      "jerseyNumber": "38",
      "position": {
        "code": "1",
        "name": "Pitcher",
        "type": "Pitcher",
        "abbreviation": "P"
      },
      "status": {
        "code": "A",
        "description": "Active"
      },
      "parentTeamId": 137
    },
    {
      "person": {
        "id": 622072,
        "fullName": "Alex Wood",
        "link": "/api/v1/people/622072"
      },
      "jerseyNumber": "57",
      "position": {
        "code": "1",
        "name": "Pitcher",
        "type": "Pitcher",
        "abbreviation": "P"
      },
      "status": {
        "code": "A",
        "description": "Active"
      },
      "parentTeamId": 137
    },
    {
      "person": {
        "id": 596103,
        "fullName": "Austin Slater",
        "link": "/api/v1/people/596103"
      },
      "jerseyNumber": "13",
      "position": {
        "code": "7",
        "name": "Outfielder",
        "type": "Outfielder",
        "abbreviation": "LF"
      },
      "status": {
        "code": "A",
        "description": "Active"
      },
      "parentTeamId": 137
    },
    {
      "person": {
        "id": 666165,
        "fullName": "Blake Sabol",
        "link": "/api/v1/people/666165"
      },
      "jerseyNumber": "2",
      "position": {
        "code": "2",
        "name": "Catcher",
        "type": "Catcher",
        "abbreviation": "C"
      },
      "status": {
        "code": "A",
        "description": "Active"
      },
      "parentTeamId": 137
    },
    {
      "person": {
        "id": 666808,
        "fullName": "Camilo Doval",
        "link": "/api/v1/people/666808"
      },
      "jerseyNumber": "75",
      "position": {
        "code": "1",
        "name": "Pitcher",
        "type": "Pitcher",
        "abbreviation": "P"
      },
      "status": {
        "code": "A",
        "description": "Active"
      },
      "parentTeamId": 137
    },
    {
      "person": {
        "id": 669477,
        "fullName": "Casey Schmitt",
        "link": "/api/v1/people/669477"
      },
      "jerseyNumber": "6",
      "position": {
        "code": "6",
        "name": "Shortstop",
        "type": "Infielder",
        "abbreviation": "SS"
      },
      "status": {
        "code": "A",
        "description": "Active"
      },
      "parentTeamId": 137
    },
    {
      "person": {
        "id": 605204,
        "fullName": "J.D. Davis",
        "link": "/api/v1/people/605204"
      },
      "jerseyNumber": "7",
      "position": {
        "code": "5",
        "name": "Third Base",
        "type": "Infielder",
        "abbreviation": "3B"
      },
      "status": {
        "code": "A",
        "description": "Active"
      },
      "parentTeamId": 137
    },
    {
      "person": {
        "id": 596001,
        "fullName": "Jakob Junis",
        "link": "/api/v1/people/596001"
      },
      "jerseyNumber": "34",
      "position": {
        "code": "1",
        "name": "Pitcher",
        "type": "Pitcher",
        "abbreviation": "P"
      },
      "status": {
        "code": "A",
        "description": "Active"
      },
      "parentTeamId": 137
    },
    {
      "person": {
        "id": 592626,
        "fullName": "Joc Pederson",
        "link": "/api/v1/people/592626"
      },
      "jerseyNumber": "23",
      "position": {
        "code": "10",
        "name": "Designated Hitter",
        "type": "Hitter",
        "abbreviation": "DH"
      },
      "status": {
        "code": "A",
        "description": "Active"
      },
      "parentTeamId": 137
    },
    {
      "person": {
        "id": 690986,
        "fullName": "Kyle Harrison",
        "link": "/api/v1/people/690986"
      },
      "jerseyNumber": "45",
      "position": {
        "code": "1",
        "name": "Pitcher",
        "type": "Pitcher",
        "abbreviation": "P"
      },
      "status": {
        "code": "A",
        "description": "Active"
      },
      "parentTeamId": 137
    },
    {
      "person": {
        "id": 664774,
        "fullName": "LaMonte Wade Jr.",
        "link": "/api/v1/people/664774"
      },
      "jerseyNumber": "31",
      "position": {
        "code": "3",
        "name": "First Base",
        "type": "Infielder",
        "abbreviation": "1B"
      },
      "status": {
        "code": "A",
        "description": "Active"
      },
      "parentTeamId": 137
    },
    {
      "person": {
        "id": 657277,
        "fullName": "Logan Webb",
        "link": "/api/v1/people/657277"
      },
      "jerseyNumber": "62",
      "position": {
        "code": "1",
        "name": "Pitcher",
        "type": "Pitcher",
        "abbreviation": "P"
      },
      "status": {
        "code": "A",
        "description": "Active"
      },
      "parentTeamId": 137
    },
    {
      "person": {
        "id": 592426,
        "fullName": "Luke Jackson",
        "link": "/api/v1/people/592426"
      },
      "jerseyNumber": "77",
      "position": {
        "code": "1",
        "name": "Pitcher",
        "type": "Pitcher",
        "abbreviation": "P"
      },
      "status": {
        "code": "A",
        "description": "Active"
      },
      "parentTeamId": 137
    },
    {
      "person": {
        "id": 573262,
        "fullName": "Mike Yastrzemski",
        "link": "/api/v1/people/573262"
      },
      "jerseyNumber": "5",
      "position": {
        "code": "8",
        "name": "Outfielder",
        "type": "Outfielder",
        "abbreviation": "CF"
      },
      "status": {
        "code": "A",
        "description": "Active"
      },
      "parentTeamId": 137
    },
    {
      "person": {
        "id": 571745,
        "fullName": "Mitch Haniger",
        "link": "/api/v1/people/571745"
      },
      "jerseyNumber": "17",
      "position": {
        "code": "7",
        "name": "Outfielder",
        "type": "Outfielder",
        "abbreviation": "LF"
      },
      "status": {
        "code": "A",
        "description": "Active"
      },
      "parentTeamId": 137
    },
    {
      "person": {
        "id": 672275,
        "fullName": "Patrick Bailey",
        "link": "/api/v1/people/672275"
      },
      "jerseyNumber": "14",
      "position": {
        "code": "2",
        "name": "Catcher",
        "type": "Catcher",
        "abbreviation": "C"
      },
      "status": {
        "code": "A",
        "description": "Active"
      },
      "parentTeamId": 137
    },
    {
      "person": {
        "id": 657557,
        "fullName": "Paul DeJong",
        "link": "/api/v1/people/657557"
      },
      "jerseyNumber": "18",
      "position": {
        "code": "6",
        "name": "Shortstop",
        "type": "Infielder",
        "abbreviation": "SS"
      },
      "status": {
        "code": "A",
        "description": "Active"
      },
      "parentTeamId": 137
    },
    {
      "person": {
        "id": 676254,
        "fullName": "Ryan Walker",
        "link": "/api/v1/people/676254"
      },
      "jerseyNumber": "74",
      "position": {
        "code": "1",
        "name": "Pitcher",
        "type": "Pitcher",
        "abbreviation": "P"
      },
      "status": {
        "code": "A",
        "description": "Active"
      },
      "parentTeamId": 137
    },
    {
      "person": {
        "id": 518397,
        "fullName": "Scott Alexander",
        "link": "/api/v1/people/518397"
      },
      "jerseyNumber": "54",
      "position": {
        "code": "1",
        "name": "Pitcher",
        "type": "Pitcher",
        "abbreviation": "P"
      },
      "status": {
        "code": "A",
        "description": "Active"
      },
      "parentTeamId": 137
    },
    {
      "person": {
        "id": 640455,
        "fullName": "Sean Manaea",
        "link": "/api/v1/people/640455"
      },
      "jerseyNumber": "52",
      "position": {
        "code": "1",
        "name": "Pitcher",
        "type": "Pitcher",
        "abbreviation": "P"
      },
      "status": {
        "code": "A",
        "description": "Active"
      },
      "parentTeamId": 137
    },
    {
      "person": {
        "id": 573124,
        "fullName": "Taylor Rogers",
        "link": "/api/v1/people/573124"
      },
      "jerseyNumber": "33",
      "position": {
        "code": "1",
        "name": "Pitcher",
        "type": "Pitcher",
        "abbreviation": "P"
      },
      "status": {
        "code": "A",
        "description": "Active"
      },
      "parentTeamId": 137
    },
    {
      "person": {
        "id": 642731,
        "fullName": "Thairo Estrada",
        "link": "/api/v1/people/642731"
      },
      "jerseyNumber": "39",
      "position": {
        "code": "4",
        "name": "Second Base",
        "type": "Infielder",
        "abbreviation": "2B"
      },
      "status": {
        "code": "A",
        "description": "Active"
      },
      "parentTeamId": 137
    },
    {
      "person": {
        "id": 663941,
        "fullName": "Tristan Beck",
        "link": "/api/v1/people/663941"
      },
      "jerseyNumber": "43",
      "position": {
        "code": "1",
        "name": "Pitcher",
        "type": "Pitcher",
        "abbreviation": "P"
      },
      "status": {
        "code": "A",
        "description": "Active"
      },
      "parentTeamId": 137
    },
    {
      "person": {
        "id": 643511,
        "fullName": "Tyler Rogers",
        "link": "/api/v1/people/643511"
      },
      "jerseyNumber": "71",
      "position": {
        "code": "1",
        "name": "Pitcher",
        "type": "Pitcher",
        "abbreviation": "P"
      },
      "status": {
        "code": "A",
        "description": "Active"
      },
      "parentTeamId": 137
    },
    {
      "person": {
        "id": 685133,
        "fullName": "Wade Meckler",
        "link": "/api/v1/people/685133"
      },
      "jerseyNumber": "53",
      "position": {
        "code": "O",
        "name": "Outfield",
        "type": "Outfielder",
        "abbreviation": "OF"
      },
      "status": {
        "code": "A",
        "description": "Active"
      },
      "parentTeamId": 137
    },
    {
      "person": {
        "id": 527038,
        "fullName": "Wilmer Flores",
        "link": "/api/v1/people/527038"
      },
      "jerseyNumber": "41",
      "position": {
        "code": "3",
        "name": "First Base",
        "type": "Infielder",
        "abbreviation": "1B"
      },
      "status": {
        "code": "A",
        "description": "Active"
      },
      "parentTeamId": 137
    }
  ],
  "link": "/api/v1/teams/137/roster",
  "teamId": 137,
  "rosterType": "active"
}`;

const VENUE_2395_JSON = ` {
  "venues": [{
    "id": 2395,
    "name": "Oracle Park",
    "link": "/api/v1/venues/2395",
    "active": true,
    "season": "2023"
  }]
}`
