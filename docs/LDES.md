# LDES in LMB

## LDES Feeds Produced by LMB

We will be using LDES to sync with different partners:

- the Meeting notes system (e.g. Gelinkt Notuleren, but it could be a vendor specific provider too, for easy writing the text below will use GN to denote any software taking the role of the Notulering-system)
- the Vlaamse Mandatendatabank
- interested vendors
- interested local users at the side of the local government

### Draft Mandataris instances for GN

LMB will be the sole owner of Mandataris instances: it will be the place where Mandataris instances are created and modified. This also means that URIs are only created in LMB (or the system filling the role of LMB in case of a vendor specific system).

As GN will not be allowed to create Mandataris instances, it needs to be supplied with draft Mandataris instances in order to link a Besluit to them in order for them to be made official. This means we need to create these draft Mandataris instances in LMB too. We can do this with a boolean flag. However, in our LDES feeds, they shouldn't be called Mandataris (or be in the Mandataris LDES feed) until they are no longer in the draft state. The URI for these draft Mandataris instances will need to be the same as the final instance, because otherwise, GN cannot link a besluit to the Mandataris.

We will watch the Besluit instances published by GN for links between a Besluit and a Mandataris through `mandaat:bekrachtigtAanstellingVan` so we can automatically mark a mandataris as official. NOTE: this predicate is currently not being published correctly.

However, there is no guarantee that the besluit will be created in GN. Therefore it should be possible to mark a mandataris as official (as opposed to draft) manually, even if no event was received from GN. In that case, a link to the meeting notes of the corresponding meeting can be provided manually.

### Publishing to Vlaamse Mandatendatabank

LMB extracts the Mandaten scope from Loket. Therefore, it should also pick up the role of sharing this information with the central publication system, specifically the Vlaamse Mandaten Databank (VMDB). This is done through the public LDES stream. Currently though, our LDES stream is being picked up by Loket, which then publishes deltas for consumption by the mandatendatabank.

## Published streams

This application publishes 3 streams:

- **public**: a public stream with limited information. This stream contains the information sent to abb but removes sensitive information like RRN numbers of person entities
- **abb**: a stream to be used by ABB consumers. This is to be secured in the future and holds all instances that are part of the Mandatendatabank model: mandaat:Mandataris, mandaat:Fractie, org:Membership, mandaat:Mandaat, person:Person, dct:PeriodOfTime, adms:Identifier, persoon:Geboorte, schema:ContactPoint, locn:Address. It only exposes the properties known to the model + dct:modified, mu:uuid and rdf:type.
- **public**: a stream to be used internally. Currently this exposes the same model instances as the abb stream but with all of their properties.

## Types exposed on LDES feed

VMDB will be interested in instances of the following types:

- **mandaat:Mandataris:** the abb and internal streams contain all Mandatarissen, the public stream does not contain Mandatarissen in the draft publication state.
- **mandaat:Fractie:** as the local government can define their own instances of Fracties to link a Mandataris to
- **org:Membership:** when used to define the membership of a Mandataris of a Fractie
- **dct:PeriodOfTime** this is inferred from the Membership and the Mandataris as a membership is supposed to have a PeriodOfTime with the same start and end as the Mandataris.
- **ext:BeleidsdomeinCode:** as a mandataris can be linked to these concepts and a local government can define their own set of concepts here
- **person:Person:** normally, the Person a Mandataris links to can be found in the election results and so this information should be globally available (and non-modifiable). However, there are cases where an unelected person can still be called in to assume a Decretaal mandaat. These are also published so the Person a Mandataris links to has meaning. This also happens for the head of OCMW organisation, who can be made schepen. Luckily, there is an api to get the uri of a person given the RRN. Person still needs to be on the LDES, but this likely means we need to secure our LDES with an authorization layer as there can be no personal info on our public LDES feed
- **persoon:Geboorte:** as part of the Person information above
- **adms:Identifier:** as part of the Person information above
- **schema:ContactPoint:** to model the contact point of the Mandataris above
- **locn:Address:** to model the address of the Mandataris above

The public and abb streams only contain predicates that are defined in the application profiles for [mandatendatabank](https://data.vlaanderen.be/doc/applicatieprofiel/mandatendatabank/), and [besluit-publicatie](https://data.vlaanderen.be/doc/applicatieprofiel/besluit-publicatie/). The internal stream has no restrictions on which predicates are published.

## Mandataris as a Versioned Entity

A Mandataris is a Versioned Entity, meaning that when one wants to model a change in state of Mandataris from e.g. 'actief' to 'verhinderd' at time `T`, the following should happen:

- the current Mandataris entity keeps its `mandaat:status`, but the `mandaat:einde` changes to `T`. Let's call this original Mandataris entity `O`.
- a new Mandataris entity is created with the same content as the first, but without a `mandaat:einde` and with a `mandaat:start` set to `T`. This new Mandataris entity receives the new `mandaat:status` of 'verhinderd', lets call this new Mandataris entity `V`.
- if one wants to model that another Mandataris replaces the first, another Mandataris entity `R` is created and the new 'verhinderd' entity `V` receives a `mandaat:isTijdelijkVervangenDoor` reference to `R`.

This means that except for correcting mistakes and changing the `mandaat:einde`, Mandataris entities should never be modified.

## Expected Peripheral Knowledge

There is a substantial amount of data that is referenced in the entities on the LDES above but that is not expected to change often (or at all) and that isn't the responsibility of the LMB system to maintain. Let's call such data Peripheral Knowledge. Examples are decretale Bestuursorganen and Mandaten or Election results.

Such data will NOT be published on the LMB LDES feeds, but can be referenced by instances on our LDES feed. Therefore we expect systems that use the LDES data to have this Peripheral Knowledge loaded themselves.

This presents the question of how this peripheral knowledge reaches these different systems (and LMB itself). Because the data will not change often, a set of migrations will suffice for now. In the future, a central system could be created that provides its own LDES feed with this peripheral knowledge. Other systems can then use this feed to update their peripheral knowledge. This is something that can wait as we will likely only launch LMB centrally first (possibly one separately with heavy, heavy support). In this case, a migration or set of migrations will be good enough. Other options are:

- an LDES as discussed earlier. We can use the caching headers here to clarify that the resource isn't expected to change for another month or so. We can also terminate an LDES when we know no more data is going to change, e.g. for election results.
- we can make an interface (API, not LDES) where they just fetch the latest version.

The current state of LMB uses migrations for sharing peripheral knowledge.

## LDES setup

The LDES spec can be found [here](https://semiceu.github.io/LinkedDataEventStreams/).
We will be using the implementation provided by [redpencil.io on their github](https://github.com/redpencilio/fragmentation-producer-service) to publish the LDES. It will be fed using our own service that monitors deltas on our SEAS instance.

We'll use a time-fragmenter with pagination and the following setup for versioning:

    @prefix dct: <http://purl.org/dc/terms/>.
    @prefix ext: <http://mu.semte.ch/vocabularies/ext/>.
    @prefix xsd: <http://www.w3.org/2001/XMLSchema#>.
    @prefix ldes: <https://w3id.org/ldes#>.
    @prefix tree: <https://w3id.org/tree#>.
    @prefix prov: <http://www.w3.org/ns/prov#>.

    <stream> ldes:timestampPath prov:generatedAtTime ;
             ldes:versionOfPath dct:isVersionOf .
             ldes:retentionPolicy ext:retention .

    ext:retention a ldes:DurationAgoPolicy ;
          tree:value "P1Y"^^xsd:duration .

This also means that we promise that we will keep the data for at least one year after it was created.
The url of the type of entity will be based on the resources path of the entity type in resources.

Note here that the LDES spec calls for the use of a specific versioned URI to be created to represent the state of the concept at a certain time. This URI then refers to the true URI of that concept through the predicate defined as the value of `ldes:versionOfPath`, `dct:isVersionOf` in our case. This versioned URI is not to be confused with the versioned entity of a Mandataris. In fact, the versioned Mandataris entity will itself also have a versioned URI for every change that happened to it.

## Links to Entities

When other entities are referenced from an LDES feed instance, the original URI of that entity is used, not the versioned URI.

For instance, if this snippet is part of a `mandaat:Mandataris` instance that refers to a `person:Person`, its `mandaat:isBestuurlijkeAliasVan` predicate refers to the true URI of the person, not the person's versioned URI.

    @prefix dct: <http://purl.org/dc/terms/>.
    @prefix ext: <http://mu.semte.ch/vocabularies/ext/>.
    @prefix xsd: <http://www.w3.org/2001/XMLSchema#>.
    @prefix mandaat: <http://data.vlaanderen.be/ns/mandaat#>.

    ext:mandatarisVersioned1 dct:isVersionOf ext:mandatarisTrueUri
     dct:issued "2024-02-14T14:05:00.000Z"^^xsd:dateTime;
     mandaat:isBestuurlijkeAliasVan ext:truePersonUri.

    ext:personVersioned dct:isVersionOf ext:truePersonUri.
     dct:issued "2024-02-14T14:05:00.000Z"^^xsd:dateTime;
     foaf:name "Jos" .

Sidenote: it's also not a given that a versioned person URI exists in our LDES. They are only created if it's a person that wasn't in the election results and we had to create ourselves (e.g. for the head of an OCWM being made schepen).
