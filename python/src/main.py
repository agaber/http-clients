from argparse import ArgumentParser
from baseball.baseball_service import BaseballService

import asyncio

async def main(team: str):
  baseball_svc = BaseballService()
  result = await baseball_svc.execute(team)
  print(result.strip())

if __name__ == '__main__':
  parser = ArgumentParser()
  parser.add_argument(
      "-t",
      "--team",
      dest="team",
      help="Specify a team id or search query.",
      required=True)
  args = parser.parse_args()
  asyncio.run(main(args.team))
