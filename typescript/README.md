### Sports Stats

A command line tool that prints information about a baseball team given a team
ID or name.

#### Motivation

This app is just a reference for how to make REST API calls in TypeScript. It is
functionally identical to the other versions in this repo.

#### Tech Stack

* TypeScript
* Node.js
* Axios
* Jest
* Yargs

#### Execute

Look up by query.

```sh
$ npm install
$ npm start -- --team=mets
```

Lookup by ID

```sh
$ npm start -- --team=137
```

Run unit tests

```sh
$ npm test
```

Compile

```sh
$ npm run clean
$ npm run build
```

### Creating this project.

Because I always forget...

1. Install npm.
1. Install TypeScript

    ```sh
    $ npm install -g typescript
    ```

1. Initialize project dependencies.

    ```sh
    $ npm init
    $ npm install --save-dev typescript # alternatively, just npm i -D
    $ npm install --save-dev ts-node
    $ npm install --save-dev @types/node
    $ npm install --save axios # for http
    $ npm install --save yargs # for command line args
    $ tsc --init
    ```

1. Set up testing

    ```sh
    $ npm install --save-dev jest
    $ npm install --save-dev ts-jest
    $ npm install --save-dev @types/jest
    $ npx ts-jest config:init
    $ npm install axios axios-mock-adapter --save-dev
    ```

1. Mess with config config files (package.json, tsconfig.json, jest.config.js) as needed.
