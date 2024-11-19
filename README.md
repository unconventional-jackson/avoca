# Avoca AI Founding Engineer Take Home

This repository contains all the services and applications necessary for the Avoca AI take home.

## Overview

We have a handful of services that are necessary to run the Avoca AI platform. These services are:

- `avoca-internal-api`: An NPM package for managing "internal" APIs that I have written for the Avoca AI platform. These are predominantly authentication endpoints.
- `avoca-external-api`: An NPM package for managing the "external" Avoca API. This is a wrapper around the Housecall Pro API and makes some slight adaptations to its original OpenAPI spec.
- `api-service`: A Node.js, Express server which manages both authentication and database interactions for the Avoca AI platform. It "acts" as if it was the Housecall Pro API by facading the `avoca-external-api` package, and manages authentication for it by implementing the `avoca-internal-api` package. This service manages our persistent connection to our Postgres database via Sequelize.
- `calls-service`: A Node.js, WebSocket server which emits stochastic "calls". Calls are logged in our database, and round-robin queued / streamed to the "employees" who are currently logged in.
- `database-service`: A migrations service for our Postgres database. This service is responsible for creating and managing the schema for our database. It is based on the `sequelize-cli` package.
- `frontend-service`: A React, Vite application which is the "frontend" for the Avoca AI platform. This service is responsible for displaying the calls to the "employees" who are currently logged in and allows them to manage customers and jobs.

## Technical Considerations
