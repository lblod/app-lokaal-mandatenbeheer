alias Acl.Accessibility.Always, as: AlwaysAccessible
alias Acl.Accessibility.ByQuery, as: AccessByQuery
alias Acl.GraphSpec.Constraint.Resource.NoPredicates, as: NoPredicates
alias Acl.GraphSpec.Constraint.ResourceFormat, as: ResourceFormatConstraint
alias Acl.GraphSpec.Constraint.Resource, as: ResourceConstraint
alias Acl.GraphSpec, as: GraphSpec
alias Acl.GroupSpec, as: GroupSpec
alias Acl.GroupSpec.GraphCleanup, as: GraphCleanup

defmodule Acl.UserGroups.Config do
  defp access_by_role(group_string) do
    %AccessByQuery{
      vars: ["session_group", "session_role"],
      query: sparql_query_for_access_role(group_string)
    }
  end

  defp sparql_query_for_access_role(group_string) do
    "PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
    PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
    SELECT DISTINCT ?session_group ?session_role WHERE {
      <SESSION_ID> ext:sessionGroup/mu:uuid ?session_group;
                   ext:sessionRole ?session_role.
      FILTER( ?session_role = \"#{group_string}\" )
    }"
  end

  defp is_authenticated() do
    %AccessByQuery{
      # Let's be restrictive,
      # we want the session to be attached to a role and uuid of bestuurseeneheid ( == ?session_group )
      vars: [],
      query: "PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
        PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
        SELECT DISTINCT ?session_group ?session_role WHERE {
          <SESSION_ID> ext:sessionGroup/mu:uuid ?session_group;
                       ext:sessionRole ?session_role.
        }"
    }
  end

  def user_groups do
    # These elements are walked from top to bottom.  Each of them may
    # alter the quads to which the current query applies.  Quads are
    # represented in three sections: current_source_quads,
    # removed_source_quads, new_quads.  The quads may be calculated in
    # many ways.  The useage of a GroupSpec and GraphCleanup are
    # common.
    [
      # // PUBLIC
      %GroupSpec{
        name: "public",
        useage: [:read],
        # This is needed otherwise you can't select a bestuurseenheid to login to.
        access: %AlwaysAccessible{},
        graphs: [
          %GraphSpec{
            graph: "http://mu.semte.ch/graphs/public",
            constraint: %ResourceConstraint{
              resource_types: [
                "http://data.vlaanderen.be/ns/besluit#Bestuurseenheid"
              ]
            }
          }
        ]
      },
      %GroupSpec{
        name: "auth",
        useage: [:read],
        access: is_authenticated(),
        graphs: [
          %GraphSpec{
            graph: "http://mu.semte.ch/graphs/public",
            constraint: %ResourceConstraint{
              resource_types: [
                "http://mu.semte.ch/vocabularies/ext/FileAddress",
                "http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#FileDataObject",
                "http://www.w3.org/ns/prov#Location",
                "http://mu.semte.ch/vocabularies/ext/BestuurseenheidClassificatieCode",
                "http://mu.semte.ch/vocabularies/ext/BestuursorgaanClassificatieCode",
                "http://mu.semte.ch/vocabularies/ext/Fractietype",
                "http://mu.semte.ch/vocabularies/ext/BestuursfunctieCode",
                "http://mu.semte.ch/vocabularies/ext/MandatarisStatusCode",
                "http://mu.semte.ch/vocabularies/ext/BeleidsdomeinCode",
                "http://mu.semte.ch/vocabularies/ext/GeslachtCode",
                "http://publications.europa.eu/ontology/euvoc#Country",
                "http://data.europa.eu/eli/ontology#LegalResource",
                "http://data.vlaanderen.be/ns/mandaat#RechtsgrondAanstelling",
                "http://data.vlaanderen.be/ns/mandaat#RechtsgrondBeeindiging",
                "http://data.vlaanderen.be/ns/mandaat#RechtstreekseVerkiezing",
                "http://data.vlaanderen.be/ns/mandaat#Verkiezingsresultaat",
                "http://mu.semte.ch/vocabularies/ext/VerkiezingsresultaatGevolgCode",
                "http://www.w3.org/ns/org#Role",
                "http://data.lblod.info/vocabularies/leidinggevenden/FunctionarisStatusCode",
                "http://data.lblod.info/vocabularies/leidinggevenden/Bestuursfunctie",
                "http://www.w3.org/2004/02/skos/core#ConceptScheme",
                "http://www.w3.org/2004/02/skos/core#Concept",
                "http://data.europa.eu/m8g/PeriodOfTime",
                "http://xmlns.com/foaf/0.1/Document"
              ]
            }
          },
          %GraphSpec{
            graph: "http://mu.semte.ch/graphs/sessions",
            constraint: %ResourceFormatConstraint{
              resource_prefix: "http://mu.semte.ch/sessions/"
            }
          }
        ]
      },
      %GroupSpec{
        name: "public-r",
        useage: [:read],
        access: is_authenticated(),
        graphs: [
          %GraphSpec{
            graph: "http://mu.semte.ch/graphs/authenticated/public",
            constraint: %ResourceConstraint{
              resource_types: [
                "http://data.vlaanderen.be/ns/besluit#Bestuurseenheid"
              ],
              predicates: %NoPredicates{
                except: [
                  "http://mu.semte.ch/vocabularies/ext/viewOnlyModules"
                ]
              }
            }
          }
        ]
      },
      %GroupSpec{
        name: "org",
        useage: [:read],
        access: %AccessByQuery{
          vars: ["session_group"],
          query: "PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
                  PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
                  SELECT ?session_group ?session_role WHERE {
                    <SESSION_ID> ext:sessionGroup/mu:uuid ?session_group.
                    }"
        },
        graphs: [
          %GraphSpec{
            graph: "http://mu.semte.ch/graphs/organizations/",
            constraint: %ResourceConstraint{
              resource_types: [
                "http://xmlns.com/foaf/0.1/Person",
                "http://xmlns.com/foaf/0.1/OnlineAccount",
                "http://www.w3.org/ns/adms#Identifier"
              ]
            }
          }
        ]
      },

      # // ORG-MANDATENBEHEER
      %GroupSpec{
        name: "o-mdb-r",
        useage: [:read],
        access: access_by_role("LoketLB-mandaatGebruiker"),
        graphs: [
          %GraphSpec{
            graph: "http://mu.semte.ch/graphs/organizations/",
            constraint: %ResourceConstraint{
              resource_types: [
                "http://data.lblod.info/vocabularies/contacthub/AgentInPositie",
                "http://data.vlaanderen.be/ns/mandaat#Fractie",
                "http://data.vlaanderen.be/ns/persoon#Geboorte",
                "http://www.w3.org/ns/org#Membership",
                "http://data.vlaanderen.be/ns/besluit#Bestuursorgaan",
                "http://data.vlaanderen.be/ns/mandaat#Mandataris",
                "http://data.vlaanderen.be/ns/mandaat#Mandaat",
                "http://www.w3.org/ns/org#Post",
                "http://www.w3.org/ns/person#Person",
                "http://www.w3.org/ns/adms#Identifier",
                "http://purl.org/dc/terms/PeriodOfTime",
                "http://lblod.data.gift/vocabularies/forms/Form",
                "http://lblod.data.gift/vocabularies/forms/Extension"
              ]
            }
          }
        ]
      },
      %GroupSpec{
        name: "o-mdb-wf",
        useage: [:write, :read_for_write],
        access: access_by_role("LoketLB-mandaatGebruiker"),
        graphs: [
          %GraphSpec{
            graph: "http://mu.semte.ch/graphs/organizations/",
            constraint: %ResourceConstraint{
              resource_types: [
                "http://data.lblod.info/vocabularies/contacthub/AgentInPositie",
                "http://data.vlaanderen.be/ns/mandaat#Fractie",
                "http://data.vlaanderen.be/ns/persoon#Geboorte",
                "http://www.w3.org/ns/org#Membership",
                "http://data.vlaanderen.be/ns/mandaat#Mandataris",
                "http://data.vlaanderen.be/ns/mandaat#Mandaat",
                "http://www.w3.org/ns/org#Post",
                "http://data.vlaanderen.be/ns/besluit#Bestuursorgaan",
                "http://www.w3.org/ns/person#Person",
                "http://www.w3.org/ns/adms#Identifier",
                "http://www.w3.org/ns/activitystreams#Tombstone",
                "http://purl.org/dc/terms/PeriodOfTime",
                "http://lblod.data.gift/vocabularies/forms/Form",
                "http://lblod.data.gift/vocabularies/forms/Extension"
              ]
            }
          }
        ]
      },

      # // LEIDINGGEVENDEN
      %GroupSpec{
        name: "o-leidinggevende-rwf",
        useage: [:read, :write, :read_for_write],
        access: access_by_role("LoketLB-leidinggevendenGebruiker"),
        graphs: [
          %GraphSpec{
            graph: "http://mu.semte.ch/graphs/organizations/",
            constraint: %ResourceConstraint{
              resource_types: [
                "http://data.lblod.info/vocabularies/contacthub/AgentInPositie",
                "http://schema.org/ContactPoint",
                "http://www.w3.org/ns/locn#Address",
                "http://data.lblod.info/vocabularies/leidinggevenden/Functionaris",
                "http://data.vlaanderen.be/ns/persoon#Geboorte",
                "http://www.w3.org/ns/person#Person",
                "http://www.w3.org/ns/activitystreams#Tombstone",
                "http://www.w3.org/ns/adms#Identifier"
              ]
            }
          },
          %GraphSpec{
            graph: "http://mu.semte.ch/graphs/organizations/",
            constraint: %ResourceConstraint{
              resource_types: [
                "http://data.lblod.info/vocabularies/leidinggevenden/Bestuursfunctie"
              ],
              predicates: %NoPredicates{
                except: [
                  "http://schema.org/contactPoint"
                ]
              }
            }
          }
        ]
      },

      # // CLEANUP
      #
      %GraphCleanup{
        originating_graph: "http://mu.semte.ch/application",
        useage: [:write],
        name: "clean"
      }
    ]
  end
end
