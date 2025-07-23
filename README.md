# Lokaal mandatenbeheer

## What's included?

This repository contains multiple docker-compose files

- _docker-compose.yml_ This provides you with the backend components. There is a frontend application included which you can publish using a separate proxy (we tend to put a letsencrypt proxy in front).
- _docker-compose.dev.yml_ Provides changes for a good frontend development setup.
  - publishes the backend services on port 90 directly, so you can run `ember serve --proxy http://localhost:90/` when developing the frontend apps natively.
  - publishes the database instance on port 8890 so you can easily see what content is stored in the base triplestore
  - provides a mock-login backend service so you don't need the ACM/IDM integration.
- _docker-compose.mac.yml_ This contains some overrides for development on mac.

## Running and maintaining

General information on running and maintaining an installation.

### Before you start

```bash
  # Clone this repository
  git clone https://github.com/lblod/app-lokaal-mandatenbeheer.git

  # Move into the directory
  cd app-lokaal-mandatenbeheer
```

To ease all typing for `docker compose` commands, start by creating the following files in the directory of the project.
A `docker-compose.override.yml` file with following content:

```yaml
services:
```

And an `.env` file with following content:

```
COMPOSE_FILE=docker-compose.yml:docker-compose.dev.yml:docker-compose.override.yml
```

### Normal start

This should be your go-to way of starting the stack.

```bash
docker compose up # or 'docker compose up -d' if you want to run it in the background
```

Always double check the status of the migrations `docker compose logs -f --tail=100 migrations`
Wait for everything to boot to ensure clean caches.

Probably the first thing you'll want to do, is see wether the app is running correctly. The fastest way forward is creating adding this to your `docker-compose.override.yml`

```yaml
# (...)
frontend:
  ports:
    - 4205:80
```

This way, you can directly connect to a built version of the frontend on port `4205`. Note, you might have conflicts because the port is already busy.
you're free to change `4205` to whatever suits you.

Once the migrations have ran, you can start developing your application by connecting the ember frontend application to this backend. See <https://github.com/lblod/frontend-lokaal-mandatenbeheer> for the corresponding frontend.

### Running on mac silicon

Running the application on mac silicon can cause some troubles. For this reason an extra docker-compose file has been included, this is the file docker-compose.mac.yml, this file should be included when starting the stack. The command `docker-compose up -f docker-compose.yml -f docker-compose.dev.yml up -d` now becomes `docker compose -f docker-compose.yml -f docker-compose.dev.yml -f docker-compose.mac.yml up -d`
There are two main pain points:

1. Mac has an arm64 processor, a lot of the services don't have a multi-platform image. In the case they only have a amd64 image, docker will gave you a warning about this. In general this is not a real problem since your macbook can just emulate amd64, but still the warnings are annoying, so these are suppressed.
2. At the moment this project was setup the service mu-identifier and mu-authorization weren't working for mac (at least on my device), so you have to build these yourself, and gave them the appropriate image name and tag.

### Upgrading your setup

Once installed, you may desire to upgrade your current setup to follow development of the main stack. The following example describes how to do this.

For the dev setup, we assume you'll pull more often and thus will most likely clear the database separately:

```bash
# This assumes the .env file has been set. Cf. supra in the README.md
# Bring the application down
docker compose down
# Pull in the changes
git pull origin master
# Launch the stack
docker compose up -d
```

As with the initial setup, we wait for everything to boot to ensure clean caches. You may choose to monitor the migrations service in a separate terminal to and wait for the overview of all migrations to appear: `docker compose logs -f --tail=100 migrations`.

Once the migrations have ran, you can go on with your current setup.

### Cleaning the database

At some times you may want to clean the database and make sure it's in a pristine state, it is always a good idea to backup your data first.

```bash
# This assumes the .env file has been set. Cf. supra in the README.md
# First you should run the query CHECKPOINT in your virtuoso conductor's isql interface on localhost:8890
> docker compose virtuoso isql-v
 SQL> checkpoint;
# Then you can bring down the current setup
docker compose down
# Back-up your database folder
mv data/db data/db-bak
# If you don't want to keep your old data you can do the following:
# Keep only required database files
rm -Rf data/db
git checkout data/db
# Bring the stack back up
docker compose up
```

## Resources

A big part of the resources is shared with other applications, because of this, these resources are defined in a dedicated github repo [link](https://github.com/lblod/domain-files). The resources that originate here are defined in files of which the name starts with external-. Unfortunately there have been some changes to these files that are not reflected in the original definition.

The models this app uses are:

- [mandaten](http://data.vlaanderen.be/ns/mandaat)
- [mandatendatabank](https://data.vlaanderen.be/doc/applicatieprofiel/mandatendatabank/)
- [besluit-publicatie](https://data.vlaanderen.be/doc/applicatieprofiel/besluit-publicatie/)

### Decretaal vs Niet-decretaal

Decretaal (based on a decree) Mandates and governing bodies should never be modified by end users in this application. Rather, this application will monitor Besluiten (Decisions) made by governing bodies and update its data on Decretale concepten automatically.

Whether a Bestuursorgaan is decretaal or not depends on its type (`besluit:classificatie`), a fix list of types that are decretaal is controlled by this application.

Whether a Mandaat/Mandataris is decretaal or not depends on whether it is linked to a Decretaal Bestuursorgaan.

## Migrations

The original application had a lot of migrations, these have been pruned to a test set to be used during development. For deployment a wider data set, fetched from the production of the loket application will have to be used. The queries that have been run to fetch the test data can be found in the queries folder with an additional readme.

## LDES

This application uses LDES to share information with other applications, like the Vlaamse Mandatendatabank and Gelinkt Notuleren. Read more about it [here](docs/LDES.md).

## Vendor Sparql Access

Vendors can access the sparql endpoint through the `/vendor/sparql` endpoint. This is secured through the [lblod/vendor-login-service](https://github.com/lblod/vendor-login-service). They need to log in first using a POST request to `/vendor/login` with a body like this:

```
{
  "organization": "http://data.lblod.info/id/bestuurseenheden/d769b4b9411ad25f67c1d60b0a403178e24a800e1671fb3258280495011d8e18",
  "publisher": {
    "uri": "http://data.lblod.info/vendors/c5da766f-f1a6-426a-9a4d-36b96a855e18",
    "key": "my super secret key that i should replace"
  }
}
```

In this request the `organization` property contains the URI of the bestuurseenheid they want to have access for. They provide their own URI in the `publisher.uri` field and their key in the `publisher.key` field.

New publishers can be registered using a migration e.g. like the [add-vendor-login.sparql](./config/migrations/2024/20240319110700-add-vendor-login.sparql) on in this repo. This migration links the vendor's user to the organizations it can act on behalf of and adds the right roles to their account. HOWEVER you should NEVER add a key for the vendor in this migration. The key should be added using a manual query/migration on the production server, e.g. the [add-vendor-key.sparql](./queries/vendor-access/add-vendor-key.sparql) example query in this repo. It should NEVER be put in the git repo.

Once the vendor is logged in, they receive a token in their cookie, like is done with the normal login service and they can access the `/vendor/sparql` endpoint using that cookie. This endpoint acts exactly like the normal sparql endpoint, but also [verifies](./config/sparql-authorization-wrapper/filter.js) that the user can act on behalf of an organization (as a secondary precaution after the login service).

An example request to the vendor's sparql endpoint could be a POST with Content-Type: application/x-www-form-urlencoded and body `query=SELECT+DISTINCT+?s+?p+?o+WHERE+{+?s+?p+?o+.+}+LIMIT+10` (so the url encoded query).

## Ingesting external data

### Organisatie Portaal

We fetch the bestuurseenheden and bestuursorganen from Organisatie Portaal. To fetch this data we have a service `op-public-consumer`. Follow these steps to get all the data in your database.

> Note that when using a database dumb this is probably already done

1. Start the stack without the `op-public-consumer` service
2. Let the `migrations` run until they are done
3. Start the `op-public-consumer` service.This will take around 10 minutes to consume the data. 
4. They application should be good to go

## Additional notes

### Custom forms

In the authorization config, we added a class `ext:CustomFormType`. This was added to trick the database into inserting unknown types. These types are custom forms that each have a unique type URI. As they are unique and we cannot dynamically add these types to the auth config, we insert the data with the allowed (`ext:CustomFormType`) type and the dynamic one.

### Performance

- The default virtuoso settings might be too weak if you need to ingest the production data. Hence, there is better config, you can take over in your `docker-compose.override.yml`

```
  virtuoso:
    volumes:
      - ./data/db:/data
      - ./config/virtuoso/virtuoso-production.ini:/data/virtuoso.ini
      - ./config/virtuoso/:/opt/virtuoso-scripts
```

### delta-producer-report-generator

Not all required parameters are provided, since deploy specific, see [report-generator](https://github.com/lblod/delta-producer-report-generator)

### deliver-email-service

Should have credentials provided, see [deliver-email-service](https://github.com/redpencilio/deliver-email-service)
