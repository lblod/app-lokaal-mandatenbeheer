# Changes in resources

Since the domain model was reviewed the resources have been refactored to delete what wasn't really used anymore or what wasn't necessary, this gives a small overview of the changes.

## Deleted resources

Vendor resource wasn't in the original and wasn't used anymore, so this has been deleted.
Organization
Organization-status-code
Site
Site-type
Participation

## File reorganisation

Some files have been renamed and reshuffled to better reflect the domain and how it is structured.

These files have been renamed:

- master-files-domain -> files
- master-users-domain -> user

- slave-besluit-domain -> external-besluit
- slave-contact-domain -> external-contact
- slave-leidinggevenden-domain -> external-leidinggevenden
- slave-mandaat-domain -> external-mandaat

The file organisation has been deleted, since the only resource in it belongs to external-besluit (this has resource has thus been moved).

The superclasses are defined in a standalone file to make sure these are imported first and don't really belong to the domain of one specific file.

## Problems

The resource organization is a bit problematic, if I interpret the domain model correctly the orginization should be an abstract resource implemented in bestuursorgaan or bestuurseenheid, however these don't actually inherit from the organization resource. For this reason, the organization resource has been deleted.
