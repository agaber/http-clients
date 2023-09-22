import asyncio
import csv
import datetime
import io
import json
import logging.config
import requests

HEADERS = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
}

class BaseballService:

  def __init__(self, base_url='https://statsapi.mlb.com/'):
    self.base_url = base_url
    self.log = logging.getLogger(__name__)

  async def execute(self, query: str) -> str:
    team_async = await asyncio.create_task(self.fetch_mlb_team(query))
    team = await team_async
    if not team:
      return 'Not Found'
    roster = await asyncio.create_task(self.fetch_mlb_roster(team["id"]))
    venue = await asyncio.create_task(self.fetch_mlb_venue_by_id(team["venue"]["id"]))
    return self.print_roster(roster, team, venue)

  async def fetch_mlb_roster(self, teamId: int):
    r = requests.get(f'{self.base_url}/api/v1/teams/{teamId}/roster', headers=HEADERS)
    if r.status_code == 200:
      return json.loads(r.content.decode('utf-8'))
    else:
      self.log.error(f'Error fetching roster for {teamId}. Status code: {r.status_code}')
      return None

  async def fetch_mlb_team(self, query: str):
    return self.fetch_mlb_team_by_id(int(query)) if query.isnumeric() \
        else self.fetch_mlb_team_by_name(query)

  async def fetch_mlb_team_by_id(self, teamId: int):
    r = requests.get(f'{self.base_url}/api/v1/teams/{teamId}', headers=HEADERS)
    if r.status_code == 200:
      data = json.loads(r.content.decode('utf-8'))
      return data['teams'][0] if data['teams'] and len(data['teams']) == 1 else None
    else:
      self.log.error(f'Error fetching team for id {teamId}. Status code: {r.status_code}')
      return None

  async def fetch_mlb_team_by_name(self, query: str):
    season = datetime.datetime.now().year
    r = requests.get(
        f'{self.base_url}/api/v1/teams',
        headers=HEADERS,
        params={'season': season, 'sportIds': 1})
    if r.status_code == 200:
      data = json.loads(r.content.decode('utf-8'))
      teams =  [t for t in (data['teams'] or [])
          if t['active'] and query.lower() in t['name'].lower()]
      return teams[0] if len(teams) > 0 else None
    else:
      self.log.error(f'Error fetching roster for query {query}. Status code: {r.status_code}')
      return None

  async def fetch_mlb_venue_by_id(self, venueId: int):
    r = requests.get(f'{self.base_url}/api/v1/venues/{venueId}', headers=HEADERS)
    if r.status_code == 200:
      data = json.loads(r.content.decode('utf-8'))
      venues =  [v for v in (data['venues'] or [])if v['active']]
      return venues[0] if len(venues) > 0 else None
    else:
      self.log.error(f'Error fetching venue for {venueId}. Status code: {r.status_code}')
      return None

  def print_roster(self, roster, team, venue) -> str:
    rows = [['Team', 'Jersey', 'Name', 'Position', 'Home Stadium']]
    players = sorted(roster["roster"], key=lambda p: p["person"]["fullName"])
    for player in roster["roster"]:
      rows.append([
        team['name'],
        player['jerseyNumber'],
        player['person']['fullName'],
        player['position']['abbreviation'],
        venue['name'],
      ])
    csv_buffer = io.StringIO()
    csv_writer = csv.writer(csv_buffer)
    csv_writer.writerows(rows)
    csv_string = csv_buffer.getvalue()
    csv_buffer.close()
    return csv_string
