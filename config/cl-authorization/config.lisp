;;;;;;;;;;;;;;;;;;;
;;; delta messenger
(in-package :delta-messenger)

(setf *delta-handlers* nil)
(add-delta-logger)
(add-delta-messenger "http://deltanotifier/")

;;;;;;;;;;;;;;;;;
;;; configuration
(in-package :client)
(setf *log-sparql-query-roundtrip* t)
(setf *backend* "http://virtuoso:8890/sparql"
      ;; (list "http://triplestore:8890/sparql"
      ;;       "http://triplestore1:8890/sparql"
      ;;       "http://triplestore2:8890/sparql"
      ;;       "http://triplestore3:8890/sparql"
      ;;       )
      )

(in-package :server)
(setf *log-incoming-requests-p* t)

;;;;;;;;;;;;;;;;;
;;; access rights

(in-package :acl)

(defparameter *access-specifications* nil
  "All known ACCESS specifications.")

(defparameter *graphs* nil
  "All known GRAPH-SPECIFICATION instances.")

(defparameter *rights* nil
  "All known GRANT instances connecting ACCESS-SPECIFICATION to GRAPH.")

(type-cache::add-type-for-prefix "http://mu.semte.ch/sessions/" "http://mu.semte.ch/vocabularies/session/Session")

(define-prefixes
  :astreams "http://www.w3.org/ns/activitystreams#"
  :adms "http://www.w3.org/ns/adms#"
  :besluit "http://data.vlaanderen.be/ns/besluit#"
  :contacthub "http://data.lblod.info/vocabularies/contacthub/"
  :dct "http://purl.org/dc/terms/"
  :euvoc "http://publications.europa.eu/ontology/euvoc#"
  :ext "http://mu.semte.ch/vocabularies/ext/"
  :eli "http://data.europa.eu/eli/ontology#"
  :foaf "http://xmlns.com/foaf/0.1/"
  :lblodlg "http://data.lblod.info/vocabularies/leidinggevenden/"
  :locn "http://www.w3.org/ns/locn#"
  :m8g "http://data.europa.eu/m8g/"
  :mandaat "http://data.vlaanderen.be/ns/mandaat#"
  :musession "http://mu.semte.ch/vocabularies/session/"
  :nfo "http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#"
  :org "http://www.w3.org/ns/org#"
  :person "http://www.w3.org/ns/person#"
  :persoon "http://data.vlaanderen.be/ns/persoon#"
  :prov "http://www.w3.org/ns/prov#"
  :schema "http://schema.org/"
  :skos "http://www.w3.org/2004/02/skos/core#"
  :extlmb "http://mu.semte.ch/vocabularies/ext/lmb/"
  :form "http://lblod.data.gift/vocabularies/forms/"
  :lmb "http://lblod.data.gift/vocabularies/lmb/"
  :sh "http://www.w3.org/ns/shacl#"
)

(define-graph public ("http://mu.semte.ch/graphs/public")
  ("ext:FileAddress" -> _)
  ("nfo:FileDataObject" -> _)
  ("prov:Location" -> _)
  ("besluit:Bestuurseenheid" -> _)
  ("ext:BestuurseenheidClassificatieCode" -> _)
  ("ext:BestuursorgaanClassificatieCode" -> _)
  ("lmb:Bestuursperiode" -> _)
  ("ext:Fractietype" -> _)
  ("ext:BestuursfunctieCode" -> _)
  ("ext:MandatarisStatusCode" -> _)
  ("ext:BeleidsdomeinCode" -> _)
  ("ext:GeslachtCode" -> _)
  ("euvoc:Country" -> _)
  ("mandaat:RechtstreekseVerkiezing" -> _)
  ("mandaat:Verkiezingsresultaat" -> _)
  ("ext:VerkiezingsresultaatGevolgCode" -> _)
  ("org:Role" -> _)
  ("skos:ConceptScheme" -> _)
  ("skos:Concept" -> _)
  ("foaf:Document" -> _)
  ("ext:DisplayType" -> _)
  ("ext:FormLibraryEntry" -> _)
  ("ext:FormLibrary" -> _)
  ("form:ValidPhoneNumber" -> _)
  ("form:RequiredConstraint" -> _)
  ("lmb:MandatarisPublicationStatusCode" -> _))

(define-graph sessions ("http://mu.semte.ch/graphs/sessions")
  ("musession:Session" -> _))

(define-graph impersonating-sessions ("http://mu.semte.ch/graphs/sessions/")
  ("musession:Session" -> _))


(define-graph view-only-modules ("http://mu.semte.ch/graphs/authenticated/public")
  ("besluit:Bestuurseenheid" -> "ext:viewOnlyModules"))

(define-graph organization ("http://mu.semte.ch/graphs/organizations/")
  ("foaf:Person" -> _)
  ("foaf:OnlineAccount" -> _)
  ("adms:Identifier" -> _))

(define-graph common-over-application ("http://mu.semte.ch/graphs/common/")
  ("ext:GlobalSystemMessage" -> _))

(define-graph organization-mandatendatabank ("http://mu.semte.ch/graphs/organizations/")
  ("contacthub:AgentInPositie" -> _)
  ("mandaat:Fractie" -> _)
  ("persoon:Geboorte" -> _)
  ("persoon:Overlijden" -> _)
  ("org:Membership" -> _)
  ("besluit:Besluit" -> _)
  ("besluit:Artikel" -> _)
  ("eli:LegalResource" -> _)
  ("besluit:Bestuursorgaan" -> _)
  ("mandaat:Mandataris" -> _)
  ("mandaat:Mandaat" -> _)
  ("ext:BeleidsdomeinCode" -> _)
  ("org:Post" -> _)
  ("person:Person" -> _)
  ("adms:Identifier" -> _)
  ("form:Form" -> _)
  ("form:Extension" -> _)
  ("form:Field" -> _)
  ("form:ValidPhoneNumber" -> _)
  ("form:RequiredConstraint" -> _)
  ("lmb:Installatievergadering" -> _)
  ("lmb:InstallatievergaderingStatus" -> _)
  ("mandaat:RechtstreekseVerkiezing" -> _)
  ("mandaat:Kandidatenlijst" -> _)
  ("ext:KandidatenlijstLijsttype" -> _)
  ("mandaat:Verkiezingsresultaat" -> _)
  ("ext:SystemNotification" -> _)
  ("astreams:Tombstone" -> _)
  ("ext:BestuurseenheidContact" -> _)
  ("ext:VerkiezingsresultaatGevolgCode" -> _)
  ("schema:ContactPoint" -> _)
  ("locn:Address" -> _)
  ("sh:ValidationResult" -> _)
  ("sh:ValidationReport" -> _))

(define-graph besluiten ("http://mu.semte.ch/graphs/besluiten-consumed")
  ("eli:LegalResource" -> _)
  ("besluit:Artikel" -> _)
  ("besluit:Besluit" -> _))

(supply-allowed-group "public")

(grant (read)
       :to-graph public
       :for-allowed-group "public")

(supply-allowed-group "vendor"
  :parameters ("session_group" "session_role")
  :query "PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
          PREFIX muAccount: <http://mu.semte.ch/vocabularies/account/>
          PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
          SELECT DISTINCT ?session_group ?session_role WHERE {
            VALUES ?session {
              <SESSION_ID>
            }
            {{
              ?session muAccount:canActOnBehalfOf/mu:uuid ?session_group;
                           muAccount:account/ext:sessionRole ?session_role.
            } UNION {
              ?session muAccount:account ?account.
              ?session muAccount:canActOnBehalfOf/ext:isOCMWVoor/mu:uuid ?session_group ;
                                      muAccount:account/ext:sessionRole ?session_role.
              ?session muAccount:canActOnBehalfOf/ext:isOCMWVoor/^<http://lblod.data.gift/vocabularies/lmb/heeftBestuurseenheid>/<http://lblod.data.gift/vocabularies/lmb/hasStatus> <http://data.lblod.info/id/concept/InstallatievergaderingStatus/a40b8f8a-8de2-4710-8d9b-3fc43a4b740e> .
              VALUES ?account {
                <http://data.lblod.info/vendors/14db001d-ea0f-4a8a-8453-c48547347588> # Cipal
                <http://data.lblod.info/vendors/42edb420-08c7-4ede-9961-bc0e527d0f3b> # Green Valley
                <http://data.lblod.info/vendors/dc62419e-1267-44e7-9562-0114e2708b6f> # Remmicom
              }
            }}
          }")

(supply-allowed-group "admin"
  :parameters ()
  :query "PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
      PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
      SELECT DISTINCT ?session_role ?session_group WHERE {
        VALUES ?session_role {
          \"LoketLB-admin\"
        }
        VALUES ?session_id {
          <SESSION_ID>
        }
        {
          ?session_id ext:sessionRole ?session_role ;
            ext:sessionGroup/mu:uuid ?session_group .
        } UNION {
          ?session_id ext:originalSessionRole ?session_role ;
            ext:originalSessionGroup ?session_group.
        }
      }
      LIMIT 1"
)

(grant (read)
       :to-graph organization-mandatendatabank
       :for-allowed-group "vendor")

(grant (read write)
       :to-graph sessions
       :for-allowed-group "admin")

(grant (read write)
       :to-graph common-over-application
       :for-allowed-group "admin")

(grant (read)
       :to-graph common-over-application
       :for-allowed-group "public")

(supply-allowed-group "authenticated"
  :parameters ()
  :query "PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
          PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
          SELECT DISTINCT ?session_group ?session_role WHERE {
            <SESSION_ID> ext:sessionGroup/mu:uuid ?session_group;
                         ext:sessionRole ?session_role.
          }")

(supply-allowed-group "impersonating-authenticated"
  :parameters ("session_group")
  :query "PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
          PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
          SELECT DISTINCT ?session_group ?session_role WHERE {
            <SESSION_ID> ext:sessionGroup/mu:uuid ?current_session_group;
                         ext:sessionRole ?current_session_role;
                         ext:originalSessionGroup/mu:uuid ?session_group;
                         ext:originalSessionRole ?session_role.

          }")


(grant (read)                           ; you already can from "public"
       :to-graph public
       :for-allowed-group "authenticated")

(grant (read)
       :to-graph besluiten
       :for-allowed-group "authenticated")

(grant (read)
       :to-graph sessions
       :for-allowed-group "authenticated")

(grant (read)
       :to-graph impersonating-sessions
       :for-allowed-group "impersonating-authenticated")

(grant (read)
       :to-graph view-only-modules
       :for-allowed-group "authenticated")

(supply-allowed-group "organization-member"
  :parameters ("session_group")
  :query "PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
          PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
          SELECT ?session_group ?session_role WHERE {
            <SESSION_ID> ext:sessionGroup/mu:uuid ?session_group.
          }")

(grant (read)
       :to-graph organization
       :for-allowed-group "organization-member")

(supply-allowed-group "mandaat-gebruiker"
  :parameters ("session_group" "session_role")
  :query "PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
          PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
          SELECT DISTINCT ?session_group ?session_role WHERE {
            <SESSION_ID> ext:sessionGroup/mu:uuid ?session_group;
                         ext:sessionRole ?session_role.
            FILTER( ?session_role = \"LoketLB-mandaatGebruiker\" )
          }")

(supply-allowed-group "politieraad-lezer"
  :parameters ("session_group" "session_role")
  :query "PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
          PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
          SELECT DISTINCT ?session_group ?session_role WHERE {
            <SESSION_ID> ext:sessionGroup ?original_session_group;
                         ext:sessionRole ?session_role.
            ?original_session_group ext:deeltBestuurVan/mu:uuid ?session_group.

            FILTER( ?session_role = \"LoketLB-mandaatGebruiker\" )
          }")

(grant (read)
        :to-graph organization-mandatendatabank
        :for-allowed-group "politieraad-lezer")


(grant (read write)
       :to-graph organization-mandatendatabank
       :for-allowed-group "mandaat-gebruiker")
