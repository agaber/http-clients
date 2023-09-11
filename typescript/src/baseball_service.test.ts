import AxiosMockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { BaseballService } from '@/baseball_service';
import * as fs from 'fs';

describe('Baseball service', () => {
  let axiosMock: AxiosMockAdapter;
  let baseballService: BaseballService;

  beforeEach(() => {
    const mockDate = new Date(2020, 9, 5);
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
    baseballService = new BaseballService('http://fake');
    axiosMock = new AxiosMockAdapter(axios);

    axiosMock
      .onGet(
        'http://fake/api/v1/teams',
        { params: { season: '2020', sportIds: '1' } })
      .reply(200, read('teams.json'));

    axiosMock
      .onGet('http://fake/api/v1/teams/137')
      .reply(200, read('team-137.json'));

    axiosMock
      .onGet('http://fake/api/v1/teams/137/roster')
      .reply(200, read('team-137-roster.json'));

    axiosMock
      .onGet('http://fake/api/v1/venues/2395')
      .reply(200, read('venue-2395.json'));
  });

  afterEach(() => {
    axiosMock.restore();
  });

  it('looks up a team by ID', async () => {
    const result = await baseballService.execute('137');
    expect(result).toEqual(EXPECTED_GIANTS);
  });

  it('prints not found when looking up by invalid ID', async () => {
    const result = await baseballService.execute('999');
    expect(result).toEqual('Not Found');
  });

  it('looks up a team by name', async () => {
    const result = await baseballService.execute('giants');
    expect(result).toEqual(EXPECTED_GIANTS);
  });

  it('prints not found when looking up by invalid name', async () => {
    const result = await baseballService.execute('knicks');
    expect(result).toEqual('Not Found');
  });
});

function read(fileName: string): string {
  const currentDir = __dirname.replace('/dist', '/src')
  return fs.readFileSync(`${currentDir}/testing/${fileName}`, 'utf-8');
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
San Francisco Giants,41,Wilmer Flores,1B,Oracle Park`;
