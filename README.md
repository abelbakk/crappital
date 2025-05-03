# crappital

Program systems development @ SZTE 2024-2025

The fake netbank app is built on the MEAN stack:

- MongoDB
- NodeJS, TS, Express server
- Angular

## How to: install and run

### Through [Docker Compose](https://docs.docker.com/compose/)

Probably the easiest choice with the least overhead.

- in the Git root, execute the following command: `docker-compose up --build -d`
- to de-compose: `docker-compose down -v`

Server will be accessible on port 5000 (for stuff like /api-docs or /openapi.json).

**Client will be accessible through port 9021**.

### With Docker

- each component contains a Dockerfile
- similar steps to the ones described in the docker-compose descriptor are required

#### Build the images

```bash
docker build -t crappital-mongo ./db
docker build -t crappital-server ./server
docker build -t crappital-client ./crappital-client
```

#### (Opt) Create a volume for MongoDB data

```bash
docker volume create mongodb_data
```

#### Run the containers - they do depend on each other

```bash
docker run -d --name crappital-mongo -p 27017:27017 -v mongodb_data:/data/db -e MONGO_INITDB_ROOT_USERNAME=root -e MONGO_INITDB_ROOT_PASSWORD=crappital -e MONGO_INITDB_DATABASE=crappital crappital-mongo
```

```bash
docker run -d --name crappital-server -p 5000:5000 --link crappital-mongo:mongodb -e "DB_URL=mongodb://root:crappital@mongodb:27017/crappital?authSource=admin" crappital-server
```

```bash
docker run -d --name crappital-client -p 9021:80 --link crappital-server:server crappital-client
```

Server will be accessible on port 5000 (for stuff like /api-docs or /openapi.json).

**Client will be accessible through port 9021**.

#### To clean up

```bash
docker stop crappital-client crappital-server crappital-mongo
docker rm crappital-client crappital-server crappital-mongo
docker rmi crappital-client crappital-server crappital-mongo
docker volume rm mongodb_data
```

### Local/hybrid setup

- provide MongoDB from wherever you'd like
- run `npm install` for both the server and client
- for the server: `npm run build` and `npm run start` (possibly need to add some env stuff for the db connection; the server supports [dotenv](https://www.npmjs.com/package/dotenv))
- for the client - with the server running already `npm run generate` and (well...) `npm run start` (or build it properly and serve it through something)

## Initial data

For demonstration purposes, there are users as well as entities of each type that are created whenever the MongoDB container is created. For specific stuff, see `db/data.js`. Password for all users is `Y3JhcHBpdGFs` (Base64-encoded here, requires decoding first).
