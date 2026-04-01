# Changelog

## 1.1.9 (2026-04-01)

### :house: Internal
 - Bumped mandataris-service to v0.9.8
 - Bumped frontend to v0.9.9

### :rocket: Enhancement
  - Unlink mandate before linking 
  - Fix datetime of mandate data in Dessel (ocmw/gemeente) 

## 1.1.8 (2026-03-13)

### :house: Internal
 - Bumped mandataris-service to v0.9.7
 - Bumped frontend to v0.9.8

### :rocket: Enhancement
  - Fix fraction data 
  - Loosen validation for replacements
  - Import aantal houders from OP as a migration 

## 1.1.7 (2026-01-07)

### :house: Internal
 - Bumped frontend to v0.9.7

### :rocket: Enhancement
  - Scripts to extract the Data of Aalst from the database. To be used in local deployment.
  - Fix politiezone data
  - Get aantal houders from OP-consumer

## 1.88.0 (2023-10-31)
### general
- update virtuoso
### Deploy instructions
- see: https://github.com/lblod/app-digitaal-loket/pull/426
## 1.87.0 (2023-10-20)
### general
- bump cache graph maintainer
- final version berichtencentrum-sync-with-kalliope
### inzendingen
- update time window of export: start from 01-09-2023 now
### subsidies
- make attachments availible over deltas
- fix login endpoint for delta-consumer
### Deploy instructions
Note: the deploy instructions assume we come from 1.85.0. So you might restart a bit too much. But that's okay.
```
drc restart virtuoso publication-triplestore
```
```
drc restart export-submissions berichtencentrum-sync-with-kalliope delta-producer-publication-graph-maintainer-subsidies delta-producer-publication-graph-maintainer-worship-submissions dispatcher migrations report-generation resource enrich-submission validate-submission; drc up -d
```
## 1.86.0 (2023-10-17)
- update forms
- add status to worship mandates producer
### Deploy notes
- drc restart migrations berichtencentrum-sync-with-kalliope delta-producer-publication-graph-maintainer-ws-sensitive ; drc up -d prepare-submissions-for-export-service
## 1.85.3 (2023-10-19)
### General
 - Bump multiple delta-related services
 - Tweak virtuoso and publication datastore to account for bigger datasets
### Submissions
 - prepare migration to export besluitenlijsten politiezones
 - bump prepare-submission-for-export to have live streaming politiezones
### Deploy instructions
```
drc restart virtuoso publication-triplestore migrations; drc up -d
```
## 1.85.2 (2023-10-16)
### Erediensten
- fix reports: extra fixes, plus added extra info for bedienaren.
## 1.85.1 (2023-10-13)
### General
- bump report-generation
### Erediensten
- fix reports: improved code and removed bugs
## 1.85.0 (2023-09-22)
### General
- Add an environment variable to the frontend that can be used to display a "global system notification" to the users
- Bump identifier
### Erediensten
- Bumped version berichtencentrum with kalliope, to have less data coming through
- Bump report generation; better character escape
- Improved mandatarissen-report

### Deploy instructions
Automatic submission as very hot fix in docker-compose.override.yml. Remove this.
If a maintenance message needs to be displayed, uncomment the environment variable in the docker-compose.override.yml file and edit the message.
```
drc up -d loket controle automatic-submission berichtencentrum-sync-with-kalliope report-generation identifier
```
## 1.84.3 (2023-09-22)
- added ag2b
## 1.84.2 (2023-09-21)
- besluitenlijst politiezone
- new producers, because much data
-
### Deploy instructions
In your docker-compose.override.yml
- Ensure delta-producer-background-jobs-initiator-submissions is renamed to delta-producer-background-jobs-initiator
- Ensure delta-producer-publication-graph-maintainer-submissions is renamed to delta-producer-publication-graph-maintainer

In file config/delta-producer/background-jobs-initiator/config.json ensure `"startInitialSync": false` is set to `"startInitialSync": true,`
In file config/delta-producer/publication-graph-maintainer/config.json ensure
```
# ...
"key": "the key in the docker-compose override previously"
```
Then
```
drc up -d --remove-orphans; drc -r restart dispatcher deltanotifier migrations
```

## 1.84.1 (2023-09-01)
  - Startdate lekp 1 & 2 set to august 31 (past)
## 1.84.0 (2023-08-31)
### general
- various improvements automatic-submissoin
  - bugfixes, cleanup
  - feature: delete submission
### subsidies
- VGC added for Stadsvernieuwing - thematische subsidie
### Deploy instructions
```
drc up -d; drc restart migrations resource cache subsidy-applications-management database dispatcher
```
## 1.83.4 (2023-08-29)
### LPDC
  - bump ldes-consumer
### Deploy instructions
```
drc up -d lpdc-ldes-consumer
```
## 1.83.3 (2023-08-25)
### General
  - Add autonoom gemeentebedrijf mercator APB Kappelen
### Deploy instructions
```
drc up -d migrations
```
and trigger the `update-bestuurseenheid-mock-login` service.
## 1.83.2 (2023-08-23)
### LPDC
  - cleanup `&nbsp` from `dct:description`
## 1.83.1 (2023-08-08)
  - add uuids to subsidy producer export config
## 1.83.0 (2023-07-25)
### General
  - added AGB berlaar bestuurseenheid
### Worship services
  - setup worship consumer to harvest from vendor
  - added reports to report on harvested information
### personeelsbeheer
  - added IFIC personeel
###  subsidies
  - moved deadlines LEKP subsidies
### Deploy instructions
```
drc restart migrations resource cache deltanotifier; drc up -d
```
## 1.82.5 (2023-07-19)
### LPDC
  - bump frontend (fixing issue archived vs revision in the UI)
### Deploy instructions
  - `drc up -d loket` to fetch the new version
## 1.82.4 (2023-07-19)
### LPDC
  - bump `lpdc-management-service` to v0.24.4
### Deploy instructions
  - `drc up -d lpdc-management` to fetch the new version
## 1.82.3 (2023-07-19)
### LPDC
  - bump `lpdc-management-service` to v0.24.3
### Deploy instructions
  - `drc up -d lpdc-management` to fetch the new version
## 1.82.2 (2023-07-19)
### Leidinggevenden
  - Update config so correct predicate for postal code is exported
### Deploy instructions
```
drc restart delta-producer-publication-graph-maintainer-leidinggevenden
```
## 1.82.1 (2023-07-18)
### LPDC
  - bump `lpdc-management-service` to v0.24.2
### Deploy instructions
  - `drc up -d lpdc-management` to fetch the new version
## 1.82.0 (2023-06-30)
### General
  - Frontend [v0.80.0 - v0.84.0](https://github.com/lblod/frontend-loket/blob/development/CHANGELOG.md#v0840-2023-06-22)
  - bump `berichtencentrum-email-notification-service`
  - bump `mu-resource and mu-auth`
### Inzending voor toezicht
  - Only toezichthoudende betrokkenheid should be shown (hence bump enrich-submission)
  - Update besluit handhaven form label to Besluit handhaven na ontvangst schorsingsbesluit
  - Update semantic form to include a new custom alert component in the Besluit handhaven na ontvangst schorsingsbesluit form
### Erediensten
  - flush, rerun op sync migrations to fix typeBetrokkenheid
### Subsidies
  - Add two new external subsidies (Hoppinpunten and Haltes)
### LPDC
  - Add "nieuw" and "toegevoegd" labels and filters to concepts
  - Add support for concept archiving
### deploy instructions
#### Virtuoso update
  - stop the stack: `drc stop`
  - start the "maintenance" frontend?
  - start the virtuoso container: `drc start virtuoso`
  - create a new checkpoint so the transaction log is cleared:
      - enter the isql-v environment: `drc exec virtuoso isql-v`
      - create a checkpoint: `exec('checkpoint');`
      - exit the isql-v environment: `exit;`
  - stop the virtuoso service
  - make a backup of the data/db folder in case something goes wrong and we need to downgrade again `cp -r data/db some-backup-folder`
  - remove the transaction log file: `rm data/db/virtuoso.trx`
  - `drc up -d virtuoso` to update to the new image
  - check the logs to see if nothing strange happened
#### Other
- Follow the steps to re-sync data from OP
- `drc restart migrations` and check if they ran successfully
- `drc restart cache resource database dispatcher subsidy-applications-management report-generation enrich-submission; drc up -d`
## 1.81.1 (2023-05-18)
### Inzending voor toezicht
  - bump import submission: centrale besturen should also be able to provide normal attachements.
### deploy instructions
```
drc up -d
```
## 1.81.0 (2023-05-18)
### General
  - Frontend [v0.79.3](https://github.com/lblod/frontend-loket/blob/development/CHANGELOG.md#v0793-2023-05-04)
  - Bump adressenregister services
  - Frontend vendor access management: allows setting read-only
### Subsidies
  - Add new thematische stadsvernieuwing subsidie
  - Add LEKP 2.1 Indienen Pact report
### LPDC
  - Remove the English requirement for text fields when publication channel "YourEurope" is not chosen
### deploy instructions
  - update the `-prod` and `-controle` frontend images to the correct version
  -
    ```
    drc restart migrations
    ```
    Check the migrations were ok.
    ```
    drc restart cache resource database subsidy-applications-management report-generation; drc up -d
    ```
### Extra notes
 - The bump of mu-resource and mu-auth (i.e. the performance improvement) has been postponed dueu to new bugs.
## 1.80.3 (2023-05-17)
### Inzending voor toezicht
  - hotfix: vendor-data-distrbution-service breaking data.
  - Historical data for vendor-api is availible now.
### deploy instructions
```
drc up -d; drc restart migrations
```
## 1.80.2 (2023-05-16)
### General
  - add new bestuurseenheid (`Politiezone Rivierenland`)
## 1.80.1 (2023-05-10)
### general
  - Added vendor API
### deploy instructions
```
drc restart database dispatcher deltanotifier; drc up -d
```
## 1.80.0 (2023-04-30)
### general
  - Frontend [v0.78.0 & v0.79.0](https://github.com/lblod/frontend-loket/blob/development/CHANGELOG.md#v0790-2023-04-24)
  - data: remove redundant person URIs for rotselaar councillor
  - Frontend-vendor access management (note: this is bundled in a release, it was already 'hot'-deployed)
  - Improve Readme
  - Increased virtuoso memory for default deploys
### Inzending voor toezicht
 - remove Advies samenvoeging for Gemeente
 - remove Verslag lokale betrokkenheid for Gemeente and Provincie
 - A bit of a performance tweak to diminish the load import/export submissins from loket to toezicht abb
 - Fix bug automatic-submission (i.e. jobs not consistently failed weh download failed)
### LPDC
  - make the "uitvoerende overheid" an optional field
  - fix the creation of empty public service instances for some users
  - Add more organization types (Gemeenten, OCMW, Autonoom Provinciebedrijf, Autonoom Gemeentebedrijf, etc.) to the "Uitvoerende overheid" and "Bevoegde Overheid" fields
  - "YourEurope categorien" is now required if "YourEurope" is selected for "Publicatiekanalen"
### Subsidies
  -  [#389](https://github.com/lblod/app-digitaal-loket/pull/389) Change date and title for subsidie opknapwerken slaapplekken oekraine
  - new "Stadsvernieuwing fase 2" subsidy
  - Update deadlines Opknapwerken slaapplekken Oekraïne subsidy
  - Increase max body size `subsidy-applications-management`
### deploy instructions

  - update the `controle` image to `lblod/frontend-loket:0.79.0-controle` (renamed from lblod/frontend-loket:x.x.x-batch-edit)
  - Remove the image from ` image: lblod/frontend-vendor-access-management:0.7.0` from `docker-compose.override.yml`
```
  drc restart migrations cache resource dispatcher subsidy-applications-management enrich-submission export-submissions; drc up -d
```
## 1.79.2 (2023-04-27)
### Subsidy
  - Hotfix: "relevante bijlages" field in the Stadsvernieuwing - Projectsubsidie (Fase 1) and Stadsvernieuwing - Conceptsubsidie subsidies should be optional
### deploy instructions
```
  drc restart subsidy-applications-management
```
## 1.79.1 (2023-04-25)
### Toezicht
  - Added document 'afwijking principes regiovorming'.
### deploy instructions
```
  drc restart migrtions; drc up -d
```
### ⚠️notes
This is a replay from hotfix `1.78.5` which has accidently started and released from the wrong tag.
## 1.79.0 (2023-04-06)
### General
 - Added mock-login creator on new bestuurseenheid
### Worship
 - Consume data from Organisations portal: Erediensten
### deploy instructions
 - Make backup of virutoso
 - Run migrations first
 - `drc up -d`
 - Wait until the stack starts properly
 - Start the intial sync

## 1.78.5 (2023-04-24)
### Toezicht
  - Added document 'afwijking principes regiovorming'.
### deploy instructions
```
  drc restart migrations; drc up -d
```
## 1.78.4 (2023-04-04)
### Toezicht
#### backend
  - hotfix: submission filters have been changed to reduce load on system
## 1.78.3 (2023-03-30)
### General
  - added report links accross organisations
### Inzendingen voor toezicht
  - Remove list of submission to be sent to Kalliope
### deploy instructions
```
drc restart berichtencentrum-sync-with-kalliope report-generation
```
## 1.78.2 (2023-03-29)
### Sync with kalliope
  - hotfix: removed unused uri to reduce warnings
## 1.78.1 (2023-03-24)
### Worship
  - worship submissions: share publication date
     - deploy notes: `drc restart delta-producer-publication-graph-maintainer-worship-submissions`
## 1.78.0 (2023-03-23)
  - Frontend [v0.77.0 & v0.77.1](https://github.com/lblod/frontend-loket/blob/development/CHANGELOG.md#v0771-2023-03-22)
  - Vendor management frontend v0.6.0:
    - Hopefully fix a data issue by changing the way we persist changes
    - UX/UI improvements
    - General maintenance
### LPDC
  - maintain the creation order of listings in the semantic forms
### Migrations
  - updated kbo number for st andries in antwerp
## 1.77.9 (2023-03-15)
### Worship
  - fix relationship provincies and Kathedralen
## 1.77.8 (2023-03-03)
### General
  - migration to avoid obsolete failed urls will trigger a warning

## 1.77.7 (2023-03-03)
### General
  - update report a little 'hanging submissions'
### Inzendingen voor toezicht
  - Download url service robustness
  - Download url warning service
## 1.77.6 (2023-03-02)
### General
  - extra report for non-sent submission
### LPDC
  - bump lpdc-ldes-consumer
## 1.77.5 (2023-02-27)
  - Add LEKP 1.0 Opvolgmoment report
## 1.77.4 (2023-02-24)
  - Update deadline opvolgmoment LEKP 1.0 subsidy
## 1.77.3 (2023-02-16)
### migrations
  - Add a new subsidy-measure: Stadsvernieuwing - conceptsubsidie
### LPDC
  - Add dditional description field to lpdc forms
## 1.77.2 (2023-02-16)
### Worship services
  - Add representatieve organen to Vanden Broele
### General
 - Improved date entry UX by using a date input field instead of a date picker
### LPDC
 - Update to the new v2 editor
## 1.77.1 (2023-02-10)
### Worship services
  - Fix automatic submissions for religiopoint
## 1.77.0 (2023-02-08)
### General
  - Show a message about the self-registration option in ACM/IDM
  - Set up Plausible analytics
### LPDC
  - Implement the basic "review status notification" system
### Worship services
  - read only modules if the data is managed by an external vendor
  - add info messages so users know which positions they need to add
  - Remove Mandaat 'Bestuurslid van Eredienst'
### Inzendingen voor toezicht
  - Fixing issues 'Rechtspositieregeling' APB
### Subsidies
  - Stadsvernieuwing
## 1.76.4 (2023-07-02)
### Berichtencentrum
  - fix config issue
## 1.76.3 (2023-06-02)
### LPDC
  - re-publish public services with wrong language predicate
## 1.76.2 (2023-02-02)
### Toezicht
#### backend
  - hotfix cronPattern for toezicht, submission reports are now daily at 22:30
## 1.76.1 (2022-01-26)
### Toezicht
#### frontend
  - Fix the problem where the app freezes when selecting the "Belastingsreglement" option in the "Type reglement/verordening" field
## 1.76.0 (2022-01-26)
### General
#### frontend
  - modules to connect to external applications
  - bug birth date-picker
  - various improvements in semantic forms shared components
  - helpdesk link in person module
#### backend
  - Various maintenance operations, both data and code
  - Automatic submissions: migration to cogs:Jobs model, trackable submissions in the dashboard (if logged as bestuurseenheid through mock-login)
  - Various mock-login updates
  - Removal of the person reconcilation service
### Erediensten
#### inzendingen voor toezicht
  - Added besluit handhaven
  - Added Representatieve organen
  - Added forms Representatieve organen
  - Updated forms: meerjarenplanwijziging, advies budgetwijzing, advies jaarrekenig for Eredienstbestuur.
    - Extra selectbox component to link URI bestuureenheid of the advies.
  - Update publication logic for forms eredienst forms
  - Updates sync with kalliope
#### eredienst mandatarissen
  - perparation of read-only mode
  - permanent alert
  - address outside of flanders
#### eredienst bedienaren
  - perparation of read-only mode
  - address outside of flanders
#### data and data sharing
  - Added delta producer stream for eredienst-mandatarissen and bedienaren
  - Added Vandenbroele as vendor of RO's
### LPDC
 - textual updates
 - Prefill the "Authority" fields for blank service instances
 - Add support for fetching form data for conceptual public services (preparation for basic change notification feature)
 - Ensure language is correctly set in the database. (Will re-publish this information)
### Subsidies
 - open up nooddorpen and opknapwerk again
## 1.75.4 (2022-01-19)
### data migrations
- Some attachements were broken due to Kalliope, fixing these.
## 1.75.3 (2022-01-05)
### data migrations
- Remove: Bestuurslid van het bestuur van de eredienst
## 1.75.2 (2022-01-03)
### vendors
- vandenbroele was missing some centrale besturen.
## 1.75.1 (2022-12-20)
### submissions
 - Due to various issues after a batch sent in prod of automatic submission, we removed them to try again
## 1.75.0 (2022-12-16)
### Subsidies
 - fix buggy table Fietssubsidies
 - migration to skip optional step of climate subsidy 1 callup 2021
## 1.74.3 (2022-12-12)
### hofix
#### IPDC
  - Fixing required fields missing for PublicServices
  - Update publication, to compensation validation issues for nested required fields
## 1.74.2 (2022-12-06)
### hofix
#### IPDC
  - To prepare the export to ipdc, we remove the publication flag.
## 1.74.1 (2022-11-29)
### hofix
- attempt to fix load issues
## 1.74.0 (2022-11-29)
### lpdc
- allow multiple websites for procedure
- mandatory executing authority
- update code list:
  - remove rechtenverkenner vloket
  - limit doelgroep values + migrate existing
- fixes publish service: push back ipdc
### submissions
- updated LEKP forms: klimaattafels
### worship services
- several UI improvements eredienstmandaten & bedienaren
### data
- remove duplicate person Nijlen
- added betrokken lokale besturen
### chore
- fix file data model: `dct:created`
- update file service
- update dashboard
- deltanotifier files organisation
- update dumpfile producer: clean up old dumpes
## 1.73.0 (2022-10-27)
- bump file share service
- alignment identifiers for eredienstbesturen to enable ACM/IDM login
- Kerfabriek Vredegem
## 1.72.0 (2022-10-27)
- evolutions frontend loket eredienst-mandatarissen
- evolutions frontend loket eredienst-bedienaren
- producers worship submission
- upgrade prepare-submission-for-export: more fine grained rules
- lpdc evolutions: various bugfixes, re-publish flow and fixing publication issues
- fix unsaved address publications
- new vendor
- update vendor with 100+ bestuurseenheden
- various data fixes
- updated lpdc repor
- updated bestuursorganen erediensten
## 1.71.3 (2022-10-20)
- fix report fietssubsidies
## 1.71.2 (2022-10-19)
- fix an issue with the website field (LPDC)
## 1.71.1 (2022-10-18)
- fix an issue in the vendor-management app which prevented users from giving access rights to certain administrative units
## 1.71.0 (2022-10-17)
- adjust deadlines fietssubsidies
- update reports
## 1.70.1 (2022-10-12)
- hotfix climate subsidies: make sure old forms still render.
- hotfix status fietssubsidies: make sure status is set correctly
## 1.70.0 (2022-10-11)
- LEPK forms added
- Eredienst positions corrections
- Eredienst bestuursorganen corrections
- update fietssubsidie-reports
- less reports IPDC per day
## 1.69.1 (2022-10-06)
- lpdc-management ingests new organisations via IPDC
- typo in forms
## 1.69.0 (2022-10-03)
- Release LPDC-module (both fronted and backend)
- Backend maintenance:
   - bump mu-auth
   - bump publication graph maintainer
- Update data erediensten
  - codelists OP
  - link person and nationality
## 1.68.6 (2022-09-27)
- propgate persons first or last names to all the graphs it belongs to
## 1.68.5 (2022-09-27)
- update bicycle subsidy deadline
## 1.68.4 (2022-09-26)
- added e-inclusion report
## 1.68.3 (2022-09-16)
- fix files graph persons sensitive
## 1.68.2 (2022-09-15)
- fix bestuursperiodeselector
## 1.68.1 (2022-09-13)
- bump download url service (to fix issues basic-auth issues for automatic-submission)
## 1.68.0 (2022-09-05)
### subsidies
- climate subsidies
- e-inclusion subsidies
### lpdc
- API + data + backend services
### erediensten
- API + data
### frontend
- erediensten mandatees (hidden feature flag)
- lpdc (hidden feature flag)
- various maintenance updates
### various
- upgrade identifier
- bump publication graph maintainers
## 1.67.0 (2022-08-05)
- update sync with kalliope: make sure timezone data is taken into account
- subsidy climate 1.0: adaptations
- subsidy Oekraïne: nooddorpen
- subsidy Oekraïne: nooddorpen
- maintenance docker-compose.dev.yml
- mandaten module: rangorde fix
- update automatic-submission related services: CBE should be able to send data
## 1.66.0 (2022-07-11)
- climate-subsidies: call 2
  - Pre-fill data.
  - Reporting
- Cleanup double uuids personen and related
- Frontend: new version semantic forms
- Bugfix berichtencentrum-sync-with-kalliope-service
  - correct dates zitting
- new bestuurseenheid: OCMW De Wijngaard
## 1.65.2 (2022-06-26)
- vandenbroele as erediensten
## 1.65.1 (2022-06-25)
- fix data issue double person
- deactivate plan samenleven subsidy
## 1.65.0 (2022-06-16)
- Frontend updates: incremental updates/bugfixes and new components
- Prepare subsidies Oekraine (temporarily offline)
- Subsidy-applications-management service: new JS template
- Forms erediensten
- Klimaatsubsidies oproep 2
- GZG oproep 6 + 7 and reports
- GZG oproep 6 + 7 extra pick-list entries
- plan samenleven: update deadline
- Bicycle subsidies: AGB should be able to fetch these
## 1.64.4 (2022-04-26)
- hotfix: change subsidy gzg deadline + codelists
## 1.64.3 (2022-04-26)
- hotfix: show reports in concept for noodopvang
- hotfix: change deadline plan samenleven
- hotfix: fix/workaround performance persons sensitive
## 1.64.2 (2022-04-26)
 - bumped identifier
## 1.64.1 (2022-04-25)
 - tweaking cronjob setting
## 1.64.0 (2022-04-19)
### :rocket: Enhancement
 - subsidies plan samenleven deltas
 - subsidies plan samenleven
 - subsidies plan samenleven report
 - person-sensitive data deltas
### :bug: Bug Fix
 - BBCDR fix files list
### :house: Internal
 - refactor a bit authorization of deltas
 - lots of improvements in ember-submission-form-fields: deduplication, bugfixes, new components
## 1.63.0 (2022-03-31)
### :house: Internal
  - simplified producers: remove json-diff-file-producers (since provided by other services)
#### subsidies
  - update deadline climate/oproep-1/opvolgmoment
  - added plan samenleven
## 1.62.0 (2022-03-25)
#### subsidies
  - Update bike subsidy: added extra file upload fields
  - extend filtering beschikbare subsidiemaatregelen: not all types of eenheden can now submit for all subsidies
  - update labeling climate subsidy
### :house: Internal
  - huge frontend maintenance: removal of webuniversum dependencies, update ember and other maintenance
  - update publication graph maintainer (some fixes/improvements)
## 1.61.0 (2022-03-10)
#### erediensten
  - adding new bestuurseenheden
#### subsidies
  - New GZG Oproep 5 reeks + report
## 1.60.1 (2022-03-07)
### :house: Internal
  - update export submissions config, to include missing besluitenlijsten
## 1.60.0 (2022-03-01)
### :house: Internal
  - update export submissions config, to include missing besluitenlijsten
## 1.59.1 (2022-03-01)
### :house: Internal
  - update publicaiton graph maintainer config
## 1.59.0 (2022-02-25)
### :house: Internal
 - Improved reports MAR-code
 - clean up database for obsolete information
 - Introduce config file berichtencentrum sync with kalliope
### :rocket: Enhancement
- New inzendingen voor toezicht:
  - Collective notie van wantrouwen
  - Code goed bestuur
  - Overzicht presentiegelden
  - Voorstellen in verband saneringsplan
## 1.58.7 (2022-02-11)
### :house: Internal
- cleanup double subsidy bierbeek climate
## 1.58.6 (2022-02-11)
### :rocket: Enhancement
- extend deadline gzg subisdy oproep 4
## 1.58.5 (2022-02-11)
### :memo: Reports
- **[NEW]** Toezicht module:
  - Produces two CSVs in the dashboard:
    - Meldingen
    - Geuploade bestanden
- **[DEPRECATED]** Submissions
### :rocket: Enhancement
- Bumped publication-graph-maintainer to latest
## 1.58.4 (2022-02-08)
### :busts_in_silhouette: Gebruikers
- **[NEW]** OCMW vereniging: Welzijnsvereniging Ter Nethe
- **[NEW]** OCMW vereniging: De Zilveren Zwaan
## 1.58.3 (2022-02-4)
### :memo: Reports
- Submission reports now include a column for publication-date
## 1.58.2 (2022-02-4)
- Fix authorization rule for subsidies: didn't have access to the files
## 1.58.1 (2022-01-27)
- Extend the period of subsidy GzG - callup 4
## 1.58.0 (2022-01-25)
### :house: Internal
 - Re-organise migration files
 - Update performance of delta-publication flow for submissions (a separate triple store has been introduced)
### :rocket: Enhancement
 - Included forms vastelling gemeentelijk beleidskader
## 1.57.3 (2022-01-23)
### :house: Internal
 - Update file service to deal with performance issues of files deletion residing in multiple graphs
## 1.57.2 (2022-01-21)
### :house: Internal
 - fixed missing migration: move attachments of manually created submissions
## 1.57.1 (2022-01-21)
### :house: Internal
 - disable the internal mandaten report, because performance concerns
## 1.57.0 (2022-01-21)
### :house: Internal
 - move files to org-graphs: migrations and update corresponding services to handle new location
 - subsidy-applications-managenent: improve and simplify code tailored-data
### :rocket: Enhancement
- new bestuurseenheid: Politie Deinze-Zulte-Lievegem
#### subsidies
- Noodopvang Kerst 2012:
  - 7 new series forms
  - reports
- Fietsinfrastructuur: new step + reports
- Reports GzG operoep 3 and 4

## 1.56.0 (2021-12-23)
### :rocket: Enhancement
- Update report contactracing: added nazomer.

## 1.55.0 (2021-12-23)
### :rocket: Enhancement
- New report GZG: oproep 2
- Update report contactracing: KBO-number

## 1.54.0 (2021-12-21)
### :rocket: Enhancement
- Create publication producer: this will make sure submissions can be consumed by app-public-decisions
- Improve file-download-service: allow file type guessing if none is provided. (mainly to tackle VGC case)

### :house: Internal
- Validate-submission: less agressive rescheduling of remote-dataobjects, when submitting.
- Bump mu-java-script-template in multiple services, as to handle edge cases for nasty URL's
- General performance improvements on the passing of delta's by using mu-scope-ids.
- Bump all producers

## 1.53.0 (2021-12-06)
### :rocket: Enhancement
- Subsidies: improve behaviour of delete button. Don't allow delete when submitting, saving or transition to next step.
- Subsidies: GzG oproep 4
- Upgrade virtuoso version to tenforce/virtuoso:1.3.2-virtuoso7.2.5.1

### :house: Internal
- Remove export leidinggevenden and mandaten, as these are covered by delta-producers
- Remove logging to app-http-logger on export-submissions. To decrease load.
- Bump automatic-submission, to have configurable endpoint to resolve json-ld endpoints.

## 1.52.0 (2021-11-11)

### :rocket: Enhancement
- Report GzG: include concept status
- General improvement reports: make less assumptions, so potential issues with forms become more visible.
- Update submissions report to show bestuursorgaan + performance improvement
- Update GzG oproep 3: deadline

## 1.51.0 (2021-11-10)

### :rocket: Enhancement
- GzG oproep 2 and 3
- Oproep contact tracing 'nazomer'

## 1.50.3 (2021-11-04)

### :ambulance: Hotfix
- Deleted a message in the berichtencentrum that wasn't intended for this bestuurseenheid

## 1.50.2 (2021-10-29)

### :ambulance: Hotfix
- Moved Climate subsidy-consumptions one step back per request of users, accidental submission by user

## 1.50.1 (2021-10-26)

### :ambulance: Hotfix
- Moved 2 Climate subsidy-consumptions one step back per request of users, accidental submission by users

## 1.50.0 (2021-10-25)

### :house: Internal
- Update email adresses for automatic submission
- Update delta-producer-report-generator to use error notifications

### :rocket: Enhancement
- GzG report subsidies
- Force status for mandataris

## 1.49.3 (2021-10-21)

### :ambulance: Hotfix
- Moved 2 bike subsidy-consumption one step back per request of a user, accidental submission by user

## 1.49.2 (2021-10-19)

### :ambulance: Hotfix
- Moved subsidy-consumption one step back per request of a user, accidental submission by user
- Removed identical subsidy-consumptions per request of a user

### :house: Internal
- Moved up submission-date for Climate Subsidy's Proposal to 2022-10-31

## 1.49.1 (2021-10-15)

### :bug: Bug Fix
- subsidy-application-flow-management-service: Wrong branch was released, new branch for new release
- Migrations to correct subsidies which have been harmed

## 1.49.0 (2021-10-14)

### :house: Internal
- introduce alert service to get more error notifications
- improve some subsidy reports
- automatic submission service should give us alerts

### :bug: Bug Fix
- subsidy-application-flow-management-service: uncaught error
- subsidy-application-management-service: return correct http error when inconsistent state

### :rocket: Enhancement
- Introduce super SSN request
- Improve attachmenet fetching: not only text/html should be fixed
- authentication for download-url

## 1.48.4 (2021-10-08)

### :house: Internal
- change deadline subsidy

## 1.48.3 (2021-10-08)

### :house: Internal
- unblock accidentally submitted form

## 1.48.2 (2021-09-28)

### :bug: Bug Fix
- prepared Loket to reconcile user.

## 1.48.1 (2021-09-27)

### :rocket: Enhancement
- sync-with-kalliope-service: improve error handling: added gracefully handling of non-connection type of errors.
- Fietssubsidies: Improve validation on table fietssubsidies: make sure some fields cannot be left empty

### :bug: Bug Fix
- escape helpers for sparqlEscape URI: don't escape `'`
- Fietssubsidies don't show empty table on transition to next step

## 1.48.0 (2021-09-16)

### :rocket: Enhancement
 - Adjustments GZG
 - Report for fietssubsidies
 - Download URL: consistent handling of file download streams
 - update deadline fietssubsidie

### :bug: Bug Fix
 - ACM/IDM: switch betuurseeneid needed updated after breaking changes ember-acm-idm
 - Fix empty susbsidy form: DL-3028

## 1.47.1 (2021-09-10)

### :bug: Bug Fix
 - step 2 fietssubsidies, some edge cases were not fixed in the activation of step 2.

## 1.47.0 (2021-09-03)

### :house: Internal
 - bumped frontend
 - addedd CHANGELOG.md

### :bug: Bug Fix
 - step 2 fietssubsidies should take over data from step 1 in all cases

### :rocket: Enhancement
 - harvesting attachtments in automatic submission flow
