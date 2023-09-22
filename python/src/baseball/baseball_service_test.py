from unittest.mock import patch
from baseball_service import BaseballService
from freezegun import freeze_time

import datetime
import asyncio
import os.path
import unittest
import urllib.parse

def mocked_requests_get(*args, **kwargs):
  requested_url = args[0]
  parsed_url = urllib.parse.urlparse(requested_url)
  path = parsed_url.path
  if path == '/api/v1/teams' and kwargs['params'] == {'season': 2023, 'sportIds': 1}:
    return MockResponse('teams.json', 200)
  if path == '/api/v1/teams/137':
    return MockResponse('team-137.json', 200)
  if path == '/api/v1/teams/137/roster':
    return MockResponse('team-137-roster.json', 200)
  if path == '/api/v1/venues/2395':
    return MockResponse('venue-2395.json', 200)
  return MockResponse(None, 404)


@freeze_time("2023-09-22")
class BaseballServiceTest(unittest.IsolatedAsyncioTestCase):
  def setUp(self):
    self.service = BaseballService(base_url='http://fake')
    self.maxDiff = 100000

  @patch('requests.get', side_effect=mocked_requests_get)
  async def test_lookup_by_id(self, mock_get):
    result = await self.service.execute('137')
    self.assertEqual(EXPECTED_GIANTS, result.strip().replace('\r\n', '\n'))

  @patch('requests.get', side_effect=mocked_requests_get)
  async def test_lookup_by_id_not_found(self, mock_get):
    result = await self.service.execute('999')
    self.assertEqual('Not Found', result)

  @patch('requests.get', side_effect=mocked_requests_get)
  async def test_lookup_by_name(self, mock_get):
    result = await self.service.execute('giants')
    self.assertEqual(EXPECTED_GIANTS, result.strip().replace('\r\n', '\n'))

  @patch('requests.get', side_effect=mocked_requests_get)
  async def test_lookup_by_name_not_found(self, mock_get):
    result = await self.service.execute('knicks')
    self.assertEqual('Not Found', result)


EXPECTED_GIANTS = """Team,Jersey,Name,Position,Home Stadium
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

""".strip().replace('\r\n', '\n')


class MockResponse:

  def __init__(self, file_name, status_code):
    if file_name:
      cwd = os.path.abspath(__file__).replace('/baseball_service_test.py', '')
      with open(f'{cwd}/testdata/{file_name}', 'r') as f:
        self.content = f.read().encode('utf-8')
    self.status_code = status_code

  def raise_for_status(self):
    pass


if __name__ == '__main__':
  unittest.main()
