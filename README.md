# The Challenge

https://openskynetwork.github.io/opensky-api/rest.html

Using the above API, create a RESTful API in NodeJS that does the following:

Given parameters of airport, type (arrival / departure), start date and end date; return a list of aircraft with the following normalised data:

- ICAO24 of the aircraft.
- Departure airport.
- Arrival airport.
- Callsign of the aircraft.
- When it was first seen.
- When it was last seen.

## General Requirements

- Properly structured project.
- Connection to a database, normalising and caching the results from the external API. The application will then return results from the database.
- Use an ORM framework for the database connection.
- Evidence of unit tests.
- Evidence of integration tests.
- Exception handling and error failover.
- Correct use of HTTP response codes.
- Swagger style comments.

## Timeline

2 days. Code to be provided by 17:30 on Tues.

# How to use this repository

First, create a `.env` file with the following variables:

- `DATABASE_URL="file:./dev.db"` - prisma is configured to use a local sqlite database

Then, run `pnpm i` to initialise the repository

This repository comes with the following scripts:

- `dev` - run the project in dev mode with nodemon hot refresh
- `db:push` - push any prisma schema changes to the sqlite database
- `db:studio` - run the prisma studio server, accessible on [port 5555](http://localhost:5555)
- `db:format` - run the prisma text formatter on any prisma schema changes
- `test` - run the jest test suite, this needs dev mode running to run the integration tests

With the project running in dev mode, try out the following http requests:

- [http://localhost:3000/aircraft?type=arrival&airport=EDDF&begin=1517227200&end=1517230800](http://localhost:3000/aircraft?type=arrival&airport=EDDF&begin=1517227200&end=1517230800)
- [http://localhost:3000/aircraft?type=departure&airport=EDDF&begin=1517227200&end=1517230800](http://localhost:3000/aircraft?type=departure&airport=EDDF&begin=1517227200&end=1517230800)
