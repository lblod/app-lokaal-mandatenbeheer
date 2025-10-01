Based off example configuration for Organization Portal (PUBLIC) to Loket.

using this consumer, LMB consumes data from OP for realizing its business case of tracking Mandataris instances, main targets for consumption are:

- Bestuurseenheden
- Bestuursorganen
- Mandaten

However, some other things are consumed as well: skos:Concepts, sites, locations.

## Bestuursorganen

We are inserting all bestuursorganen coming from OP. The predicates of these bestuursorganen are filtered so they do not override or remove the ones we add in Lokaal Mandatenbeheer.

> NOTE
> september 2025
> We are seeing "Voorzitter van..." bestuursorganenInTijd these organen are creating bugs in the application. Because we are not using them in the application we can ignore them when they are fetched by the OP-consumer 
