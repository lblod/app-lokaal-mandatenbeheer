alias Acl.Accessibility.Always, as: AlwaysAccessible
alias Acl.Accessibility.ByQuery, as: AccessByQuery
#alias Acl.GraphSpec.Constraint.Resource.AllPredicates, as: AllPredicates
alias Acl.GraphSpec.Constraint.Resource.NoPredicates, as: NoPredicates
alias Acl.GraphSpec.Constraint.ResourceFormat, as: ResourceFormatConstraint
alias Acl.GraphSpec.Constraint.Resource, as: ResourceConstraint
alias Acl.GraphSpec, as: GraphSpec
alias Acl.GroupSpec, as: GroupSpec
alias Acl.GroupSpec.GraphCleanup, as: GraphCleanup

defmodule Acl.UserGroups.Config do
  defp access_by_role( group_string ) do
    %AccessByQuery{
      vars: ["session_group","session_role"],
      query: sparql_query_for_access_role( group_string ) }
  end

  defp access_by_role_for_single_graph( group_string ) do
    %AccessByQuery{
      vars: [],
      query: sparql_query_for_access_role( group_string ) }
  end

  defp sparql_query_for_access_role( group_string ) do
    "PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
    PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
    SELECT DISTINCT ?session_group ?session_role WHERE {
      <SESSION_ID> ext:sessionGroup/mu:uuid ?session_group;
                   ext:sessionRole ?session_role.
      FILTER( ?session_role = \"#{group_string}\" )
    }"
  end

  defp can_access_automatic_submission() do
    %AccessByQuery{
      vars: [],
      query: "PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
        PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
        SELECT DISTINCT ?session_group ?session_role WHERE {
          <SESSION_ID> ext:sessionGroup/mu:uuid ?session_group;
                       ext:sessionRole ?session_role.
          FILTER( ?session_role = \"LoketLB-vendorManagementGebruiker\" )
        }"
      }
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

  defp access_sensitive_delta_producer_data() do
    %AccessByQuery{
      vars: [ "group_name" ],
      query: "
        PREFIX foaf: <http://xmlns.com/foaf/0.1/>
        PREFIX muAccount: <http://mu.semte.ch/vocabularies/account/>
        SELECT DISTINCT ?group_name WHERE {
          <SESSION_ID> muAccount:account ?onlineAccount.

          ?onlineAccount  a foaf:OnlineAccount.

          ?agent a foaf:Agent;
            foaf:account ?onlineAccount.

          ?group foaf:member ?agent;
            foaf:name ?group_name.
        }"
      }
  end

  defp access_for_vendor_api() do
    %AccessByQuery{
      vars: ["vendor_id", "session_group"],
      query: sparql_query_for_access_vendor_api()
    }
  end

  defp sparql_query_for_access_vendor_api() do
    " PREFIX muAccount: <http://mu.semte.ch/vocabularies/account/>
      PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
      SELECT DISTINCT ?vendor_id ?session_group WHERE {
        <SESSION_ID> muAccount:canActOnBehalfOf/mu:uuid ?session_group;
                     muAccount:account/mu:uuid ?vendor_id.
      } "
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
        access: %AlwaysAccessible{}, # TODO: Should be only for logged in users
        graphs: [ %GraphSpec{
                    graph: "http://mu.semte.ch/graphs/public",
                    constraint: %ResourceConstraint{
                      resource_types: [
                        "http://mu.semte.ch/vocabularies/validation/Execution",
                        "http://mu.semte.ch/vocabularies/validation/Validation",
                        "http://mu.semte.ch/vocabularies/validation/Error",
                        "http://mu.semte.ch/vocabularies/ext/FormNode",
                        "http://mu.semte.ch/vocabularies/ext/FormInput",
                        "http://mu.semte.ch/vocabularies/ext/DynamicSubform",
                        "http://mu.semte.ch/vocabularies/ext/DocumentStatus",
                        "http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#FileDataObject",
                        "http://mu.semte.ch/vocabularies/ext/supervision/InzendingType",
                        "http://mu.semte.ch/vocabularies/ext/supervision/DecisionType",
                        "http://mu.semte.ch/vocabularies/ext/supervision/TaxType",
                        "http://mu.semte.ch/vocabularies/ext/supervision/Nomenclature",
                        "http://mu.semte.ch/vocabularies/ext/supervision/FiscalPeriod",
                        "http://mu.semte.ch/vocabularies/ext/supervision/DeliveryReportType",
                        "http://mu.semte.ch/vocabularies/ext/supervision/AccountAcceptanceStatus",
                        "http://mu.semte.ch/vocabularies/ext/supervision/DocumentAuthenticityType",
                        "http://mu.semte.ch/vocabularies/ext/supervision/RegulationType",
                        "http://www.w3.org/ns/prov#Location",
                        "http://mu.semte.ch/vocabularies/ext/BestuurseenheidClassificatieCode",
                        "http://data.vlaanderen.be/ns/besluit#Bestuursorgaan",
                        "http://mu.semte.ch/vocabularies/ext/BestuursorgaanClassificatieCode",
                        "http://mu.semte.ch/vocabularies/ext/Fractietype",
                        "http://mu.semte.ch/vocabularies/ext/KandidatenlijstType",
                        "http://data.vlaanderen.be/ns/mandaat#Kandidatenlijst",
                        "http://data.vlaanderen.be/ns/mandaat#Mandaat",
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
                        "http://data.vlaanderen.be/ns/besluit#Bestuurseenheid",
                        "http://data.lblod.info/vocabularies/leidinggevenden/FunctionarisStatusCode",
                        "http://data.lblod.info/vocabularies/leidinggevenden/Bestuursfunctie",
                        "http://persistence.uni-leipzig.org/nlp2rdf/ontologies/rlog#Entry",
                        "http://persistence.uni-leipzig.org/nlp2rdf/ontologies/rlog#Level",
                        "http://persistence.uni-leipzig.org/nlp2rdf/ontologies/rlog#StatusCode",
                        "http://mu.semte.ch/vocabularies/ext/LogSource",
                        "http://lblod.data.gift/vocabularies/employee/EmployeeTimePeriod",
                        "http://lblod.data.gift/vocabularies/employee/UnitMeasure",
                        "http://lblod.data.gift/vocabularies/employee/EducationalLevel",
                        "http://lblod.data.gift/vocabularies/employee/WorkingTimeCategory",
                        "http://lblod.data.gift/vocabularies/employee/LegalStatus",
                        "http://mu.semte.ch/vocabularies/ext/ChartOfAccount",
                        "http://mu.semte.ch/vocabularies/ext/AuthenticityType",
                        "http://mu.semte.ch/vocabularies/ext/TaxType",
                        "http://mu.semte.ch/vocabularies/ext/SubmissionDocumentStatus",
                        "http://data.vlaanderen.be/ns/besluit#Zitting",
                        "http://data.vlaanderen.be/ns/besluit#Agendapunt",
                        "http://data.vlaanderen.be/ns/besluit#BehandelingVanAgendapunt",
                        "http://www.w3.org/2004/02/skos/core#ConceptScheme",
                        "http://www.w3.org/2004/02/skos/core#Concept",
                        "http://lblod.data.gift/vocabularies/subsidie/SubsidiemaatregelConsumptieStatus",
                        "http://data.vlaanderen.be/ns/subsidie#SubsidiemaatregelAanbod",
                        "http://lblod.data.gift/vocabularies/subsidie/SubsidiemaatregelAanbodReeks",
                        "http://lblod.data.gift/vocabularies/subsidie/ApplicationFlow",
                        "http://lblod.data.gift/vocabularies/subsidie/ApplicationStep",
                        "http://data.vlaanderen.be/ns/subsidie#Subsidieprocedurestap",
                        "http://data.europa.eu/m8g/PeriodOfTime",
                        "http://data.europa.eu/m8g/Criterion",
                        "http://data.europa.eu/m8g/RequirementGroup",
                        "http://data.europa.eu/m8g/CriterionRequirement",
                        "http://data.europa.eu/m8g/Requirement",
                        "http://xmlns.com/foaf/0.1/Document",
                        "http://www.w3.org/ns/org#Organization",
                        "http://lblod.data.gift/vocabularies/organisatie/EredienstBeroepen",
                        "http://lblod.data.gift/vocabularies/organisatie/BedienaarFinancieringCode",
                        "http://lblod.data.gift/vocabularies/organisatie/VoorwaardenBedienaarCriterium",
                        "http://lblod.data.gift/vocabularies/organisatie/BedienaarCriteriumBewijsstuk",
                        "http://lblod.data.gift/vocabularies/organisatie/TypeVestiging",
                        "http://lblod.data.gift/vocabularies/organisatie/OrganisatieStatusCode",
                        "http://lblod.data.gift/vocabularies/organisatie/TypeBetrokkenheid",
                        "http://lblod.data.gift/vocabularies/organisatie/TypeEredienst",
                        "http://lblod.data.gift/vocabularies/organisatie/HelftVerkiezing"
                      ]
                    } },
                  %GraphSpec{
                    graph: "http://mu.semte.ch/graphs/sessions",
                    constraint: %ResourceFormatConstraint{
                      resource_prefix: "http://mu.semte.ch/sessions/"
                    } } ] },
      %GroupSpec{
        name: "public-r",
        useage: [:read],
        access: is_authenticated(),
        graphs: [%GraphSpec{
                    graph: "http://mu.semte.ch/graphs/authenticated/public",
                    constraint: %ResourceConstraint{
                       resource_types: [
                         "http://data.vlaanderen.be/ns/besluit#Bestuurseenheid",
                       ],
                       predicates: %NoPredicates{
                         except: [
                           "http://mu.semte.ch/vocabularies/ext/viewOnlyModules"
                         ] } } } ] },
    %GroupSpec{
        name: "public-wf",
        useage: [:write, :read_for_write],
        access: %AlwaysAccessible{}, # TODO: Should be only for logged in users
        graphs: [%GraphSpec{
                    graph: "http://mu.semte.ch/graphs/public",
                    constraint: %ResourceConstraint{
                      resource_types: [
                        "http://mu.semte.ch/vocabularies/ext/BeleidsdomeinCode",
                        "http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#Folder" #TODO: not sure why this is here
                      ]
                    } } ] },
      # // LPDC-IPDC
      %GroupSpec{
        name: "o-ipdc-lpdc-rwf",
        useage: [:read, :write, :read_for_write],
        access: access_by_role( "LoketLB-LPDCGebruiker" ),
        graphs: [ %GraphSpec{
                    graph: "http://mu.semte.ch/graphs/organizations/",
                    constraint: %ResourceConstraint{
                      resource_types: [
                        "http://xmlns.com/foaf/0.1/Document",
                        "https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicService",
                        "https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#AbstractPublicService",
                        "http://purl.org/vocab/cpsv#PublicService",
                        "https://www.w3.org/ns/activitystreams#Tombstone",
                        "http://data.europa.eu/m8g/PublicOrganisation",
                        "http://data.europa.eu/m8g/Requirement",
                        "http://data.europa.eu/m8g/Evidence",
                        "http://purl.org/vocab/cpsv#Rule",
                        "http://data.europa.eu/m8g/Cost",
                        "http://data.europa.eu/m8g/Output",
                        "https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#FinancialAdvantage",
                        "http://data.europa.eu/eli/ontology#LegalResource",
                        "http://schema.org/ContactPoint",
                        "http://www.w3.org/ns/dcat#Distribution",
                        "http://purl.org/dc/terms/Location",
                        "http://schema.org/WebSite",
                        "http://www.w3.org/ns/locn#Address",
                        "https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptDisplayConfiguration"
                        ] } } ] },
      # // ORGANIZATION HAS POSSIBLY DUPLICATE USER DATA
      %GroupSpec{
        name: "org",
        useage: [:read],
        access: %AccessByQuery{
          vars: ["session_group"],
          query: "PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
                  PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
                  SELECT ?session_group ?session_role WHERE {
                    <SESSION_ID> ext:sessionGroup/mu:uuid ?session_group.
                    }" },
        graphs: [ %GraphSpec{
                    graph: "http://mu.semte.ch/graphs/organizations/",
                    constraint: %ResourceConstraint{
                      resource_types: [
                        "http://xmlns.com/foaf/0.1/Person",
                        "http://xmlns.com/foaf/0.1/OnlineAccount",
                        "http://www.w3.org/ns/adms#Identifier",
                      ] } } ] },

      # // ORG-MANDATENBEHEER
      %GroupSpec{
        name: "o-mdb-r",
        useage: [:read],
        access: access_by_role( "LoketLB-mandaatGebruiker" ),
        graphs: [ %GraphSpec{
                    graph: "http://mu.semte.ch/graphs/organizations/",
                    constraint: %ResourceConstraint{
                      resource_types: [
                        "http://data.lblod.info/vocabularies/contacthub/AgentInPositie",
                        "http://data.vlaanderen.be/ns/mandaat#Fractie",
                        "http://data.vlaanderen.be/ns/persoon#Geboorte",
                        "http://www.w3.org/ns/org#Membership",
                        "http://data.vlaanderen.be/ns/mandaat#Mandataris",
                        "http://www.w3.org/ns/person#Person",
                        "http://www.w3.org/ns/adms#Identifier",
                        "http://mu.semte.ch/vocabularies/ext/GeneratedForm",
                        "http://purl.org/dc/terms/PeriodOfTime" ] } } ] },
      %GroupSpec{
        name: "o-mdb-wf",
        useage: [:write, :read_for_write],
        access: access_by_role( "LoketLB-mandaatGebruiker" ),
        graphs: [ %GraphSpec{
                    graph: "http://mu.semte.ch/graphs/organizations/",
                    constraint: %ResourceConstraint{
                      resource_types: [
                        "http://data.lblod.info/vocabularies/contacthub/AgentInPositie",
                        "http://data.vlaanderen.be/ns/mandaat#Fractie",
                        "http://data.vlaanderen.be/ns/persoon#Geboorte",
                        "http://www.w3.org/ns/org#Membership",
                        "http://data.vlaanderen.be/ns/mandaat#Mandataris",
                        "http://mu.semte.ch/vocabularies/ext/GeneratedForm",
                        "http://www.w3.org/ns/person#Person",
                        "http://www.w3.org/ns/adms#Identifier",
                        "http://purl.org/dc/terms/PeriodOfTime" ] } } ] },

      # // BBCDR
      %GroupSpec{
        name: "o-bbcdr-rwf",
        useage: [:read, :write, :read_for_write],
        access: access_by_role( "LoketLB-bbcdrGebruiker" ),
        graphs: [ %GraphSpec{
                    graph: "http://mu.semte.ch/graphs/organizations/",
                    constraint: %ResourceConstraint{
                      resource_types: [
                        "http://mu.semte.ch/vocabularies/ext/bbcdr/Report",
                        "http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#FileDataObject"
                      ] } } ] },

      # // TOEZICHT
      %GroupSpec{
        name: "o-toez-rwf",
        useage: [:read, :write, :read_for_write],
        access: access_by_role( "LoketLB-toezichtGebruiker" ),
        graphs: [ %GraphSpec{
                    graph: "http://mu.semte.ch/graphs/organizations/",
                    constraint: %ResourceConstraint{
                      resource_types: [
                        "http://vocab.deri.ie/cogs#Job",
                        "http://mu.semte.ch/vocabularies/ext/supervision/InzendingVoorToezicht",
                        "http://mu.semte.ch/vocabularies/ext/supervision/TaxRate",
                        "http://mu.semte.ch/vocabularies/ext/supervision/SimplifiedTaxRate",
                        "http://mu.semte.ch/vocabularies/ext/FormSolution",
                        "http://mu.semte.ch/vocabularies/ext/FileAddress",
                        "http://xmlns.com/foaf/0.1/Document",
                        "http://rdf.myexperiment.org/ontologies/base/Submission",
                        "http://mu.semte.ch/vocabularies/ext/SubmissionDocument",
                        "http://lblod.data.gift/vocabularies/besluit/TaxRate",
                        "http://lblod.data.gift/vocabularies/automatische-melding/FormData",
                        "http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#FileDataObject",
                        "http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#DataContainer",
                        "http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#LocalFileDataObject",
                        "http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#RemoteDataObject",
                        "http://lblod.data.gift/services/Service",
                        "http://lblod.data.gift/vocabularies/harvesting/HarvestingCollection",
                        "http://redpencil.data.gift/vocabularies/tasks/Operation",
                        "http://redpencil.data.gift/vocabularies/tasks/Task",
                        "http://vocab.deri.ie/cogs#ExecutionStatus",
                      ] } } ] },

      # // SUBSIDIES
      %GroupSpec{
        name: "o-subs-rwf",
        useage: [:read, :write, :read_for_write],
        access: access_by_role( "LoketLB-subsidies" ),
        graphs: [ %GraphSpec{
                    graph: "http://mu.semte.ch/graphs/organizations/",
                    constraint: %ResourceConstraint{
                      resource_types: [
                        "http://lblod.data.gift/vocabularies/subsidie/ApplicationForm",
                        "http://data.vlaanderen.be/ns/subsidie#SubsidiemaatregelConsumptie",
                        "http://data.vlaanderen.be/ns/subsidie#Aanvraag",
                        "http://schema.org/MonetaryAmount",
                        "http://data.europa.eu/m8g/Participation",
                        "http://schema.org/BankAccount",
                        "https://www.gleif.org/ontology/Base/Period",
                        "http://lblod.data.gift/vocabularies/subsidie/ApplicationFormTable",
                        "http://mu.semte.ch/vocabularies/ext/ApplicationFormEntry",
                        "http://lblod.data.gift/vocabularies/subsidie/EngagementTable",
                        "http://mu.semte.ch/vocabularies/ext/EngagementEntry",
                        "http://schema.org/ContactPoint",
                        "http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#FileDataObject",
                      ] } },
                      %GraphSpec{
                        graph: "http://mu.semte.ch/graphs/organizations/",
                        constraint: %ResourceConstraint{
                          resource_types: [
                            "http://data.vlaanderen.be/ns/besluit#Bestuurseenheid",
                            # Sometimes a very specific list of organisations should be able submit for a subsidy.
                            # This is unfortunatly the most elegant way.
                            "http://data.vlaanderen.be/ns/subsidie#SubsidiemaatregelAanbod",
                            "http://lblod.data.gift/vocabularies/subsidie/SubsidiemaatregelAanbodReeks"
                          ],
                          predicates: %NoPredicates{
                            except: [
                              "http://data.europa.eu/m8g/playsRole"
                            ] } } } ] },

      # // VENDOR MANAGEMENT
      %GroupSpec{
        name: "o-toezicht-vendor-management-rwf",
        useage: [:read, :write, :read_for_write],
        access: can_access_automatic_submission(),
        graphs: [ %GraphSpec{
                    graph: "http://mu.semte.ch/graphs/automatic-submission",
                    constraint: %ResourceConstraint{
                      resource_types: [
                        "http://mu.semte.ch/vocabularies/ext/Vendor",
                        "http://data.vlaanderen.be/ns/besluit#Bestuurseenheid"
                      ] } },
                   %GraphSpec{
                    graph: "http://mu.semte.ch/graphs/authenticated/public",
                    constraint: %ResourceConstraint{
                       resource_types: [
                         "http://data.vlaanderen.be/ns/besluit#Bestuurseenheid",
                       ],
                       predicates: %NoPredicates{
                         except: [
                           "http://mu.semte.ch/vocabularies/ext/viewOnlyModules"
                         ] } } }
                  ] },

      # // LEIDINGGEVENDEN
      %GroupSpec{
        name: "o-leidinggevende-rwf",
        useage: [:read, :write, :read_for_write],
        access: access_by_role( "LoketLB-leidinggevendenGebruiker" ),
        graphs: [ %GraphSpec{
                    graph: "http://mu.semte.ch/graphs/organizations/",
                    constraint: %ResourceConstraint{
                      resource_types: [
                        "http://data.lblod.info/vocabularies/contacthub/AgentInPositie",
                        "http://schema.org/ContactPoint",
                        "http://www.w3.org/ns/locn#Address",
                        "http://data.lblod.info/vocabularies/leidinggevenden/Functionaris",
                        "http://data.vlaanderen.be/ns/persoon#Geboorte",
                        "http://www.w3.org/ns/person#Person",
                        "http://www.w3.org/ns/adms#Identifier"
                      ] } },
                  %GraphSpec{
                    graph: "http://mu.semte.ch/graphs/organizations/",
                    constraint: %ResourceConstraint{
                      resource_types: [ "http://data.lblod.info/vocabularies/leidinggevenden/Bestuursfunctie" ],
                      predicates: %NoPredicates{
                        except: [
                          "http://schema.org/contactPoint" ] } } } ] },

      # // MESSAGING CENTRE
      %GroupSpec{
        name: "o-messaging-rwf",
        useage: [:read, :write, :read_for_write],
        access: access_by_role( "LoketLB-berichtenGebruiker" ),
        graphs: [ %GraphSpec{
                    graph: "http://mu.semte.ch/graphs/organizations/",
                    constraint: %ResourceConstraint{
                      resource_types: [
                        "http://schema.org/Message",
                        "http://schema.org/Conversation",
                        "http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#FileDataObject"
                      ] } },
                  %GraphSpec{
                    graph: "http://mu.semte.ch/graphs/organizations/",
                    constraint: %ResourceConstraint{
                      resource_types: [ "http://data.vlaanderen.be/ns/besluit#Bestuurseenheid" ],
                      predicates: %NoPredicates{
                        except: [
                          "http://mu.semte.ch/vocabularies/ext/mailAdresVoorNotificaties",
                          "http://mu.semte.ch/vocabularies/ext/wilMailOntvangen"
                        ] }
                    } } ] },

      # // EMPLOYEE NUMBERS DATABASE
      %GroupSpec{
        name: "o-employee-database-rwf",
        useage: [:read, :write, :read_for_write],
        access: access_by_role( "LoketLB-personeelsbeheer" ),
        graphs: [ %GraphSpec{
                    graph: "http://mu.semte.ch/graphs/organizations/",
                    constraint: %ResourceConstraint{
                      resource_types: [
                        "http://lblod.data.gift/vocabularies/employee/EmployeeDataset",
                        "http://lblod.data.gift/vocabularies/employee/EmployeePeriodSlice",
                        "http://lblod.data.gift/vocabularies/employee/EmployeeObservation"
                      ] } }
                ] },

      # // WORSHIP MANDATEES
      %GroupSpec{
        name: "o-worship-positions-rwf",
        useage: [:read, :write, :read_for_write],
        access: access_by_role( "LoketLB-eredienstMandaatGebruiker" ),
        graphs: [ %GraphSpec{
                    graph: "http://mu.semte.ch/graphs/organizations/",
                    constraint: %ResourceConstraint{
                      resource_types: [
                        "http://data.lblod.info/vocabularies/contacthub/AgentInPositie",
                        "http://www.w3.org/ns/adms#Identifier",
                        "http://www.w3.org/ns/person#Person",
                        "http://data.vlaanderen.be/ns/persoon#Geboorte",
                        "http://data.vlaanderen.be/ns/mandaat#Mandataris",
                        "http://schema.org/ContactPoint",
                        "http://www.w3.org/ns/locn#Address",
                        "http://www.w3.org/ns/org#Post",
                        "http://www.w3.org/ns/org#Site",
                        "http://data.lblod.info/vocabularies/erediensten/EredienstMandataris",
                        "http://data.lblod.info/vocabularies/erediensten/EredienstBestuurseenheid",
                        "http://data.lblod.info/vocabularies/erediensten/BestuurVanDeEredienst",
                        "http://data.lblod.info/vocabularies/erediensten/CentraalBestuurVanDeEredienst",
                        "http://data.lblod.info/vocabularies/erediensten/RepresentatiefOrgaan",
                        "http://data.lblod.info/vocabularies/erediensten/BetrokkenLokaleBesturen",
                        "https://data.vlaanderen.be/ns/generiek#GestructureerdeIdentificator",
                        "http://lblod.data.gift/vocabularies/organisatie/HelftVerkiezing",
                      ] } }
                ] },

      # // WORSHIP MINISTERS
      %GroupSpec{
        name: "o-worship-positions-rwf",
        useage: [:read, :write, :read_for_write],
        access: access_by_role( "LoketLB-eredienstBedienaarGebruiker" ),
        graphs: [ %GraphSpec{
                    graph: "http://mu.semte.ch/graphs/organizations/",
                    constraint: %ResourceConstraint{
                      resource_types: [
                        "http://www.w3.org/ns/adms#Identifier",
                        "http://www.w3.org/ns/person#Person",
                        "http://data.vlaanderen.be/ns/persoon#Geboorte",
                        "http://data.vlaanderen.be/ns/mandaat#Mandataris",
                        "http://schema.org/ContactPoint",
                        "http://www.w3.org/ns/locn#Address",
                        "http://data.lblod.info/vocabularies/contacthub/AgentInPositie",
                        "http://www.w3.org/ns/org#Post",
                        "http://www.w3.org/ns/org#Site",
                        "http://data.lblod.info/vocabularies/erediensten/EredienstBestuurseenheid",
                        "http://data.lblod.info/vocabularies/erediensten/BestuurVanDeEredienst",
                        "http://data.lblod.info/vocabularies/erediensten/CentraalBestuurVanDeEredienst",
                        "http://data.lblod.info/vocabularies/erediensten/RepresentatiefOrgaan",
                        "http://data.lblod.info/vocabularies/erediensten/BetrokkenLokaleBesturen",
                        "http://data.lblod.info/vocabularies/erediensten/RolBedienaar",
                        "http://data.lblod.info/vocabularies/erediensten/VoorwaardenBedienaar",
                        "http://data.lblod.info/vocabularies/erediensten/PositieBedienaar",
                        "https://data.vlaanderen.be/ns/generiek#GestructureerdeIdentificator"
                      ] } }
                ] },

     # // TOEZICHT VENDOR API
      %GroupSpec{
        name: "o-vendor-api-r",
        useage: [:read],
        access: access_for_vendor_api(),
        graphs: [ %GraphSpec{
                    graph: "http://mu.semte.ch/graphs/vendors/",
                    constraint: %ResourceConstraint{
                      resource_types: [
                        "http://rdf.myexperiment.org/ontologies/base/Submission",
                        "http://mu.semte.ch/vocabularies/ext/SubmissionDocument",
                        "http://lblod.data.gift/vocabularies/automatische-melding/FormData",
                      ] } } ] },

      # // LOKETADMIN
        %GroupSpec{
          name: "o-admin-rwf",
          useage: [:read, :write, :read_for_write],
          access: access_by_role( "LoketAdmin" ),
          graphs: [ %GraphSpec{
                      graph: "http://mu.semte.ch/graphs/organizations/",
                      constraint: %ResourceConstraint{
                        resource_types: [
                          "http://lblod.data.gift/vocabularies/reporting/Report",
                          "http://vocab.deri.ie/cogs#Job",
                          "http://open-services.net/ns/core#Error",
                          "http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#DataContainer",
                          "http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#FileDataObject",
                          "http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#DataContainer"
                        ] } } ] },

        # //LOKETADMIN -> TODO: duplicate. We need to move the data in this graph to "http://mu.semte.ch/graphs/organizations/"
        %GroupSpec{
          name: "o-admin-rwf",
          useage: [:read, :write, :read_for_write],
          access: access_by_role_for_single_graph( "LoketAdmin" ), #access_by_role_for_single_graph( "LoketAdmin" ),
          graphs: [ %GraphSpec{
                      graph: "http://mu.semte.ch/graphs/harvesting",
                      constraint: %ResourceConstraint{
                        resource_types: [
                          "http://lblod.data.gift/vocabularies/reporting/Report",
                          "http://vocab.deri.ie/cogs#Job",
                          "http://open-services.net/ns/core#Error",
                          "http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#DataContainer",
                          "http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#FileDataObject",
                          "http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#DataContainer"
                        ] } } ] },


      %GroupSpec{
        name: "o-persons-sensitive-deltas-rwf",
        useage: [ :read ],
        access: access_sensitive_delta_producer_data(),
        graphs: [ %GraphSpec{
                    graph: "http://redpencil.data.gift/id/deltas/producer/",
                    constraint: %ResourceConstraint{
                      resource_types: [
                        "http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#FileDataObject",
                        "http://www.w3.org/ns/dcat#Dataset",
                        "http://www.w3.org/ns/dcat#Distribution",
                      ] } } ] },

      # // USER HAS NO DATA
      # this was moved to org instead.
      # perhaps move some elements to public when needed for demo
      # purposes.


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
