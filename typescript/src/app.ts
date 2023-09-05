import { BaseballService } from './baseball_service';

// TODO: Consider using a command line args lib - yargs?

async function main(team: string) {
  const baseballService = new BaseballService();
  console.log(await baseballService.execute(team));
}

const args = process.argv.slice(2);
if (args.length < 1) {
  console.error('Team name or ID is required')
}
const query = args.join(' ')
main(query);
