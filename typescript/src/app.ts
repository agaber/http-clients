import { BaseballService } from './baseball_service';
import yargs from 'yargs';

const argv = yargs(process.argv.slice(2))
  .option('team', {
    alias: 't',
    description: 'Specify a team id or search query',
    type: 'string',
    demandOption: true,
  }).parseSync();

const team: string = argv.team;
main(team);

async function main(team: string) {
  const baseballService = new BaseballService();
  console.log(await baseballService.execute(team));
}
