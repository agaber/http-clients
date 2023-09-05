import { BaseballService } from './baseball_service';

async function main(team: string) {
  const baseballService = new BaseballService();
  console.log(await baseballService.execute(team));
}

const args = process.argv.slice(2);
if (args.length < 1) {
  console.error('Team name or ID is required')
}
const query = args.join(' ')
// console.log(`Looking up "${query}"`);
main(query);
