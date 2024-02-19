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

```
  # Clone this repository
  git clone https://github.com/lblod/app-lokaal-mandatenbeheer.git

  # Move into the directory
  cd app-lokaal-mandatenbeheer
```

To ease all typing for `docker compose` commands, start by creating the following files in the directory of the project.
A `docker-compose.override.yml` file with following content:

```
version: '3.7'
```

And an `.env` file with following content:

```
COMPOSE_FILE=docker-compose.yml:docker-compose.dev.yml:docker-compose.override.yml
```

To even further ease the typing for `docker compose` commands, it might be useful to add the following aliases in your terminal config:

```
alias dr='docker'
alias drc='docker compose'
```

### Normal start

This should be your go-to way of starting the stack.

```
docker compose up # or 'docker compose up -d' if you want to run it in the background
```

Always double check the status of the migrations `docker compose logs -f --tail=100 migrations`
Wait for everything to boot to ensure clean caches.

Probably the first thing you'll want to do, is see wether the app is running correctly. The fastest way forward is creating a `docker-compose.override.yml` file next to the other `docker-compose.yml` files, and add

```
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
There are two main painpoints:

1. Mac has an arm64 processor, a lot of the services don't have a multi-platform image. In the case they only have a amd64 image, docker will gave you a warning about this. In general this is not a real problem since your macbook can just emulate amd64, but still the warnings are annoying, so these are suppressed.
2. At the moment this project was setup the service mu-identifier and mu-authorization weren't working for mac (at least on my device), so you have to build these yourself, and gave them the appropriate image name and tag.

### Upgrading your setup

Once installed, you may desire to upgrade your current setup to follow development of the main stack. The following example describes how to do this.

For the dev setup, we assume you'll pull more often and thus will most likely clear the database separately:

```
# This assumes the .env file has been set. Cf. supra in the README.md
# Bring the application down
docker compose down
# Pull in the changes
git pull origin master
# Launch the stack
docker compose up
```

As with the initial setup, we wait for everything to boot to ensure clean caches. You may choose to monitor the migrations service in a separate terminal to and wait for the overview of all migrations to appear: `docker compose logs -f --tail=100 migrations`.

Once the migrations have ran, you can go on with your current setup.

### Cleaning the database

At some times you may want to clean the database and make sure it's in a pristine state, it is always a good idea to backup your data first.

```
# This assumes the .env file has been set. Cf. supra in the README.md
# First you should run the query CHECKPOINT in your virtuoso conductor's isql interface on localhost:8890
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
- [mandatendatank](https://data.vlaanderen.be/doc/applicatieprofiel/mandatendatabank/)
- [besluit-publicatie](https://data.vlaanderen.be/doc/applicatieprofiel/besluit-publicatie/)
- [leidinggevenden databank](https://lblod.github.io/pages-vendors/#/docs/leidinggevenden)

### Decretaal vs Niet-decretaal

Decretaal (based on a decree) Mandates and governing bodies should never be modified by end users in this application. Rather, this application will monitor Besluiten (Decisions) made by governing bodies and update its data on Decretale concepten automatically.

Whether a Bestuursorgaan is decretaal or not depends on its type (`besluit:classificatie`), a fix list of types that are decretaal is controlled by this application.

Whether a Mandaat/Mandataris is decretaal or not depends on whether it is linked to a Decretaal Bestuursorgaan.

## Migrations

The original application had a lot of migrations, these have been pruned to a test set to be used during development. For deployment a wider data set, fetched from the production of the loket application will have to be used. The queries that have been run to fetch the test data can be found in the queries folder with an additional readme.

## Form Content Service

An important service that is used in this repository is the [form-content-service](https://github.com/lblod/form-content-service), during development some extra settings can be useful to prevent constantly needing to rebuild this docker image. Make sure to clone the repo in the same directory as where you clone this repo and add the following to you docker-compose.override.yml, then your form-content service will automatically be rebuild if changes are made in one of it's files.

```
  form-content:
    image: semtech/mu-javascript-template:latest
    environment:
      - NODE_ENV=development
    ports:
      - "8081:80"
      - "9229:9229"
    volumes:
      - ./config/form-content:/config
      - ../form-content-service:/app
```

To check it actually builds and is done building, it can be useful to run the following command:

```
drc logs form-content -f
```

> [!CAUTION]
> The info below is not up to date anymore. These services are inherited from [loket](https://github.com/lblod/app-digitaal-loket), these aren't used anymore, but will be introduced again in the near future.

### Ingesting external data

#### Administrative units

Only the 'normal' (i.e. non-worship) administrative units are provided by default.
If you need to ingest the data for worship administrative units, you will need to ingest the data through deltas from:

- [Organisations portal](https://organisaties.abb.vlaanderen.be)
  - Note: this app also has a development and qa environment available.

##### steps

- The next steps assume `.env` file has been set, cf. supra.
- Ensure the following configuration is defined in the `docker-compose.override.yml`
  ```
  op-public-consumer:
      environment:
        DCR_SYNC_BASE_URL: "https://organisaties.abb.vlaanderen.be"
        DCR_DISABLE_INITIAL_SYNC: "true"
        DCR_DISABLE_DELTA_INGEST: "true"
  update-bestuurseenheid-mock-login:
      entrypoint: ["echo", "Service-disabled to not confuse the service"]
  ```
- `docker-compose up -d`
- Ensure all migrations have run and the stack is started and running properly.
- Extra step in case of a resync, run:
  ```
  docker-compose exec op-public-consumer curl -X POST http://localhost/flush
  docker-compose logs -f --tail=200 op-public-consumer
  ```
  - This should end with `Flush successful`.
- Update `docker-compose.override.yml` with
  ```
    op-public-consumer:
      environment:
        DCR_SYNC_BASE_URL: "https://organisaties.abb.vlaanderen.be"
        DCR_DISABLE_INITIAL_SYNC: "false" # -> this changed
        DCR_DISABLE_DELTA_INGEST: "false" # -> this changed
    update-bestuurseenheid-mock-login:
      entrypoint: ["echo", "Service-disabled to not confuse the service"]
  ```
- `docker-compose up -d`
- This might take a while if `docker-compose logs op-public-consumer |grep success`
  Returns: `Initial sync http://redpencil.data.gift/id/job/URI has been successfully run`; you should be good.
  (Your computer will also stop making noise)
- In `docker-compose.override.yml`, remove the disabled service
  `   update-bestuurseenheid-mock-login:
entrypoint: ["echo", "Service-disabled to not confuse the service"]`
  The mock-logins will be created when a cron job kicks in. You can control the moment it triggers by playing with the `CRON_PATTERN` variable.
  See the `README.md` of the related service for more options.

### Setting up the delta-producers related services

To make sure the app can share data, producers need to be set up. There is an intial sync, that is potentially very expensive, and must be started manually

#### producers mandatarissen/leidinggevenden/submissions

(Note: similar for other producers)

1. make sure the app is up and running, the migrations have run
2. in docker-compose.override.yml, make sure the following configuration is provided:

```
  delta-producer-background-jobs-initiator-mandatarissen: # or
    environment:
      START_INITIAL_SYNC: 'true'
```

3. `drc up -d delta-producer-background-jobs-initiator-mandatarissen`
4. You can follow the status of the job, through the dashboard

##### Deltas producer: extra considerations

###### Separate publication-triplestore

Due to performance issues, related to the high usage, a separate triplestore (virtuoso) has been introduced to offload the publication of the data.
This architectural change is currently under evaluation. The criteria for evaluation will be: the performance win vs the practical consequences of such change.

If deemed succesful, we might consider moving the remaining publication graphs to this triplestore too (mandatarissen and leidinggevenden).

As a consequence, producers using the separate triplestore, will also publish and host the json-diff files.
Mainly to simplify the transition to a separate publication triple store (else we would need a separate mu-auth and deltanotifier).
In essence, it takes over https://github.com/lblod/delta-producer-json-diff-file-publisher, although both can still be combined.

###### Sharing of attachments and other file data.

If files need to be shared over deltas (attachments, form-data, cached-files) you will need to set in a docker-compose.override.yml

```
#(...)
  delta-producer-publication-graph-maintainer-submissions:
    KEY: "foo-bar
```

This will needs to be set in the consuming stack too. See [delta-producer-publication-graph-maintainer](https://github.com/lblod/delta-producer-publication-graph-maintainer) for more informmation on the implications.

##### Additional notes

###### Performance (mandatarissen/leidinggevenden)

- The default virtuoso settings might be too weak if you need to ingest the production data. Hence, there is better config, you can take over in your `docker-compose.override.yml`

```
  virtuoso:
    volumes:
      - ./data/db:/data
      - ./config/virtuoso/virtuoso-production.ini:/data/virtuoso.ini
      - ./config/virtuoso/:/opt/virtuoso-scripts
```

###### delta-producer-report-generator

Not all required parameters are provided, since deploy specific, see [report-generator](https://github.com/lblod/delta-producer-report-generator)

###### deliver-email-service

Should have credentials provided, see [deliver-email-service](https://github.com/redpencilio/deliver-email-service)

# LDES in LMB

> [!CAUTION]
> This section contains the specification of how we will be using LDES. This is not implemented yet and unproven. A PoC implementation will be created in the sprint of 26-02 -> 08-03


## LDES Feeds Produced by LMB

We will be using LDES to sync with different partners: 
-   the Notulering-system (e.g. Gelinkt Notuleren, but it could be a vendor specific provider too, for easy writing the text below will use GN to denote any software taking the role of the Notulering-system)
-   the Vlaamse Mandatendatabank

### Draft Mandataris instances for GN

LMB will be the sole master of Mandataris instances (including the creation of their URIs). 

As GN will not be allowed to create Mandataris instances, it needs to be supplied with draft Mandataris instances in order to link a Besluit to them in order for them to be made official. In LMB, we can probably do this with a boolean flag, marking the Mandataris as draft. However, in our LDES feeds, they shouldn't be called Mandataris (or be in the Mandataris LDES feed) until they are no longer in the draft state. The URI for these draft Mandataris instances will need to be the same as the final instance, because otherwise, GN cannot link a besluit to the Mandataris.

We should also **watch** the LDES feed from GN for instances of Besluit with the right type (the one that makes a mandataris official) that are linked to a Mandataris (which on our side will be in draft). If we find such a Besluit, we should switch the Mandataris to official and create that link on our end too. 

However, there is no guarantee that the besluit will be created in GN. Therefore it should be possible to mark a mandataris as official (as opposed to draft) manually, even if no event was received from GN. In that case, a link to the meeting notes of the corresponding meeting can be provided manually as well.

### Publishing to Vlaamse Mandatendatabank

LMB extracts the Mandaten and Leidinggevenden scope from Loket. Therefore, it should also pick up the role of sharing this information with the central publication system, specifically the Vlaamse Mandaten Databank (VMDB). This will also be done through an LDES stream.

Since suppliers of the meeting note software (filling the role of Gelinkt Notuleren) understand SPARQL and are currently using a SPARQL endpoint on Loket for syncing, we should use the same principle for the draft Mandataris instances. This means that we expect the Vlaamse Mandatendatabank to also listen to our Draft Mandataris LDES feed and internalize this information into their SPARQL endpoint OR that we listen to the local LDES feeds in the central Loket version of LMB and provide the sparql endpoint there.

## Types exposed on LDES feed

VMDB will be interested in instances of the following types:
-   **mandaat:Mandataris:** but only the Mandataris instances in the official state
-   **mandaat:Fractie:** as the local government can define their own instances of Fracties to link a Mandataris to
-   **org:Membership:** when used to define the membership of a Mandataris of a Fractie
-   **ext:BeleidsdomeinCode:** as a mandataris can be linked to these concepts and a local government can define their own set of concepts here
-   **person:Person:** normally, the Person a Mandataris links to can be found in the election results and so this information should be globally available (and non-modifiable). However, there are cases where an unelected person can still be called in to take a Decretaal mandaat. These should be published too so the Person a Mandataris links to has meaning. This also happens for the head of OCMW, who can be made shepen. Luckily, there is an api to get the uri of a person given you have the RRN. Person still needs to be on the LDES, but this likely means we need to secure our LDES as there can be no personal info on public LDES feed
-   **persoon:Geboorte:** as part of the Person information above
-   **adms:Identifier:** as part of the Person information above
-   **lblodlg:Functionaris:** this models a Leidinggevende in the local government
-   **schema:ContactPoint:** to model the contact point of the Functionaris above
-   **locn:Address:** to model the address of the Functionaris above
-   **ext:DraftMandataris:** a type to model the draft Mandataris instances for GN and make it clear that they are different from the mandaat:Mandataris instances that are ready to be published

The only predicates that are shared about these concepts are predicates that are defined in the application profiles for [mandatendatabank](https://data.vlaanderen.be/doc/applicatieprofiel/mandatendatabank/), [leidinggevenden](https://lblod.github.io/pages-vendors/#/docs/leidinggevenden) and [besluit-publicatie](https://data.vlaanderen.be/doc/applicatieprofiel/besluit-publicatie/).

## Mandataris as a Versioned Entity

A Mandataris is a Versioned Entity, meaning that when one wants to model a change in state of Mandataris from e.g. 'actief' to 'verhinderd' at time `T`, the following should happen:
-   the current Mandataris entity keeps its `mandaat:status`, but the `mandaat:einde` changes to `T`. Let's call this original Mandataris entity `O`.
-   a new Mandataris entity is created with the same content as the first, but without a `mandaat:einde` and with a `mandaat:start` set to `T`. This new Mandataris entity receives the new `mandaat:status` of 'verhinderd', lets call this new Mandataris entity `V`.
-   if one wants to model that another Mandataris replaces the first, another Mandataris entity `R` is created and the new 'verhinderd' entity `V` receives a `mandaat:isTijdelijkVervangenDoor`  reference to `R`.

This means that except for correcting mistakes and changing the `mandaat:einde`, Mandataris entities should never be modified.

## Expected Peripheral Knowledge

There is a substantial amount of data that is referenced in the entities on the LDES above but that is not expected to change often (or at all) and that isn't the responsibility of the LMB system to maintain. Let's call such data Peripheral Knowledge.

As the LMB LDES instances reference this data, we do expect systems that the LDES data to have this Peripheral Knowledge loaded themselves. 

A suggestion would be that a central system could provide its own LDES feed that other systems can use to update their peripheral knowledge (given how little this data is expected to change, this can even be a manual update). There are multiple options here and this is something that can wait as we will likely only launch centrally first (possibly one separately with heavy, heavy support). In this case, a migration or set of migrations will be good enough. Another path is that we can make an interface (API, not LDES) where they just fetch the latest version. Another path is to use the caching headers of LDES, allowing caching for e.g. half a year. We can also terminate an LDES when we know no more data is going to change.

## LDES setup

The LDES spec can be found [here](https://semiceu.github.io/LinkedDataEventStreams/). 
We will be using the implementation provided by [redpencil.io on their github](https://github.com/redpencilio/fragmentation-producer-service) to publish the LDES. It will be fed using our own service that monitors deltas on our SEAS instance.

We'll use a time-fragmenter, one stream will be set up per type of instance that we will share, with pagination and the following setup for versioning: 

    <stream> ldes:timestampPath prov:generatedAtTime ;
             ldes:versionOfPath dct:isVersionOf .
             ldes:retentionPolicy ext:retention .
    
    ext:retention a ldes:DurationAgoPolicy ;
          tree:value "P1Y"^^xsd:duration .

This also means that we promise that we will keep the data for at least one year after it was created.
The url of the type of entity will be based on the resources path of the entity type in 

## Links to Entities

When other entities are referenced from an LDES feed instance, the original URI of that entity is used, not the versioned URI.

For instance, if this snippet is part of a `mandaat:Mandatarais` instance that refers to a `person:Person`, its `mandaat:isBestuurlijkeAliasVan` predicate refers to the true URI of the person, not the person's versioned URI (if any exists because we had to create it ourselves).

    # prefixes are as per prefix.cc
    
    ext:mandatarisVersioned1 dct:isVersionOf ext:mandatarisTrueUri
     dct:issued "2024-02-14T14:05:00.000Z"^^xsd:dateTime;
     mandaat:isBestuurlijkeAliasVan ext:truePersonUri.
