### Sports Stats

A command line tool that prints information about a baseball team given a team
ID or name.

#### Motivation

This app is just a reference for how to make REST API calls in Python. It is
functionally identical to the other versions in this repo.

#### Execute

Look up by query.

```sh
$ pip install -r requirements.txt
$ python3 src/main.py --team=mets
```

Lookup by ID

```sh
$ python3 src/main.py --team=137
```

Run unit tests

```sh
$ find . -type f -name "*_test.py" | xargs python3
```

Alternative that doesn't work for me yet

```shell
python3 -m unittest discover -s ./ -p '*_test.py'
```
