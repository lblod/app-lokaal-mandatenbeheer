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

(define-prefixes
  :contacthub "http://data.lblod.info/vocabularies/contacthub/"
  :besluit "http://data.vlaanderen.be/ns/besluit#"
  :mandaat "http://data.vlaanderen.be/ns/mandaat#"
  :persoon "http://data.vlaanderen.be/ns/persoon#"
  :ext "http://mu.semte.ch/vocabularies/ext/"
  :dct "http://purl.org/dc/terms/"
  :adms "http://www.w3.org/ns/adms#"
  :org "http://www.w3.org/ns/org#"
  :person "http://www.w3.org/ns/person#"
  :musession "http://mu.semte.ch/vocabularies/session/"
  :foaf "http://xmlns.com/foaf/0.1/")

(define-graph public ("http://mu.semte.ch/graphs/public")
  ("ext:FileAddress" -> _)
  ("http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#FileDataObject" -> _)
  ("http://www.w3.org/ns/prov#Location" -> _)
  ("besluit:Bestuurseenheid" -> _)
  ("http://mu.semte.ch/vocabularies/ext/BestuurseenheidClassificatieCode" -> _)
  ("http://mu.semte.ch/vocabularies/ext/BestuursorgaanClassificatieCode" -> _)
  ("http://mu.semte.ch/vocabularies/ext/Fractietype" -> _)
  ("http://mu.semte.ch/vocabularies/ext/BestuursfunctieCode" -> _)
  ("http://mu.semte.ch/vocabularies/ext/MandatarisStatusCode" -> _)
  ("http://mu.semte.ch/vocabularies/ext/BeleidsdomeinCode" -> _)
  ("http://mu.semte.ch/vocabularies/ext/GeslachtCode" -> _)
  ("http://publications.europa.eu/ontology/euvoc#Country" -> _)
  ("http://data.europa.eu/eli/ontology#LegalResource" -> _)
  ("http://data.vlaanderen.be/ns/mandaat#RechtsgrondAanstelling" -> _)
  ("http://data.vlaanderen.be/ns/mandaat#RechtsgrondBeeindiging" -> _)
  ("http://data.vlaanderen.be/ns/mandaat#RechtstreekseVerkiezing" -> _)
  ("http://data.vlaanderen.be/ns/mandaat#Verkiezingsresultaat" -> _)
  ("http://mu.semte.ch/vocabularies/ext/VerkiezingsresultaatGevolgCode" -> _)
  ("http://www.w3.org/ns/org#Role" -> _)
  ("http://data.lblod.info/vocabularies/leidinggevenden/FunctionarisStatusCode" -> _)
  ("http://data.lblod.info/vocabularies/leidinggevenden/Bestuursfunctie" -> _)
  ("http://www.w3.org/2004/02/skos/core#ConceptScheme" -> _)
  ("http://www.w3.org/2004/02/skos/core#Concept" -> _)
  ("http://data.europa.eu/m8g/PeriodOfTime" -> _)
  ("http://xmlns.com/foaf/0.1/Document" -> _))

(define-graph sessions ("http://mu.semte.ch/graphs/sessions")
  ("musession:Session" -> _))

(define-graph view-only-modules ("http://mu.semte.ch/graphs/authenticated/public")
  ("besluit:Bestuurseenheid" -> "ext:viewOnlyModules"))

(define-graph organization ("http://mu.semte.ch/graphs/organizations/")
  ("http://xmlns.com/foaf/0.1/Person" -> _)
  ("http://xmlns.com/foaf/0.1/OnlineAccount" -> _)
  ("http://www.w3.org/ns/adms#Identifier" -> _))

(define-graph organization-mandatendatabank ("http://mu.semte.ch/graphs/organizations/")
  ("http://data.lblod.info/vocabularies/contacthub/AgentInPositie" -> _)
  ("http://data.vlaanderen.be/ns/mandaat#Fractie" -> _)
  ("http://data.vlaanderen.be/ns/persoon#Geboorte" -> _)
  ("http://www.w3.org/ns/org#Membership" -> _)
  ("http://data.vlaanderen.be/ns/besluit#Bestuursorgaan" -> _)
  ("http://data.vlaanderen.be/ns/mandaat#Mandataris" -> _)
  ("http://data.vlaanderen.be/ns/mandaat#Mandaat" -> _)
  ("http://mu.semte.ch/vocabularies/ext/BeleidsdomeinCode" -> _)
  ("http://www.w3.org/ns/org#Post" -> _)
  ("http://www.w3.org/ns/person#Person" -> _)
  ("http://www.w3.org/ns/adms#Identifier" -> _)
  ("http://purl.org/dc/terms/PeriodOfTime" -> _)
  ("http://mu.semte.ch/vocabularies/ext/Form" -> _)
  ("http://mu.semte.ch/vocabularies/ext/Extension" -> _)
  ("http://mu.semte.ch/vocabularies/ext/Installatievergadering" -> _)
  ("http://mu.semte.ch/vocabularies/ext/InstallatievergaderingStatus" -> _)
  ("http://data.vlaanderen.be/ns/mandaat#RechtstreekseVerkiezing" -> _)
  ("http://data.vlaanderen.be/ns/mandaat#Kandidatenlijst" -> _)
  ("http://mu.semte.ch/vocabularies/ext/KandidatenlijstLijsttype" -> _)
  ("http://data.vlaanderen.be/ns/mandaat#Verkiezingsresultaat" -> _)
  ("http://mu.semte.ch/vocabularies/ext/VerkiezingsresultaatGevolgCode" -> _))

(define-graph organization-leidinggevende ("http://mu.semte.ch/graphs/organizations/")
  ("http://data.lblod.info/vocabularies/contacthub/AgentInPositie" -> _)
  ("http://schema.org/ContactPoint" -> _)
  ("http://www.w3.org/ns/locn#Address" -> _)
  ("http://data.lblod.info/vocabularies/leidinggevenden/Functionaris" -> _)
  ("http://data.vlaanderen.be/ns/persoon#Geboorte" -> _)
  ("http://www.w3.org/ns/person#Person" -> _)
  ("http://www.w3.org/ns/activitystreams#Tombstone" -> _)
  ("http://www.w3.org/ns/adms#Identifier" -> _)
  ("http://data.lblod.info/vocabularies/leidinggevenden/Bestuursfunctie"
   -> "http://schema.org/contactPoint"))

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
            <SESSION_ID> muAccount:canActOnBehalfOf/mu:uuid ?session_group;
                         muAccount:account/ext:sessionRole ?session_role.
          }")

(grant (read)
       :to-graph organization-mandatendatabank
       :for-allowed-group "vendor")

(supply-allowed-group "authenticated"
  :parameters ()
  :query "PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
          PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
          SELECT DISTINCT ?session_group ?session_role WHERE {
            <SESSION_ID> ext:sessionGroup/mu:uuid ?session_group;
                         ext:sessionRole ?session_role.
          }")


(grant (read)                           ; you already can from "public"
       :to-graph public
       :for-allowed-group "authenticated")

(grant (read)
       :to-graph sessions
       :for-allowed-group "authenticated")

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

(grant (read write)
       :to-graph organization-mandatendatabank
       :for-allowed-group "mandaat-gebruiker")

(supply-allowed-group "leidinggevende-gebruiker"
  :parameters ("session_group" "session_role")
  :query "PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
          PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
          SELECT DISTINCT ?session_group ?session_role WHERE {
            <SESSION_ID> ext:sessionGroup/mu:uuid ?session_group;
                         ext:sessionRole ?session_role.
            FILTER( ?session_role = \"LoketLB-leidinggevendenGebruiker\" )
          }")

(grant (read write)
       :to organization-leidinggevende
       :for "mandaat-gebruiker")

