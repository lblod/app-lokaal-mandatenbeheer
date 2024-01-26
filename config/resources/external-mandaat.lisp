;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;; MANDAAT ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; this is a shared domain file, maintained in https://github.com/lblod/domain-files (file master-mandaat-domain)
;; some resources have been updated from the original implementation.
;; also not all resources have been imported.

(define-resource fractie ()
  :class (s-prefix "mandaat:Fractie")
  :properties `((:naam :string ,(s-prefix "regorg:legalName"))
                (:generated-from :uri-set ,(s-prefix "ext:generatedFrom"))) ;;if it e.g. comes from gelinkt-notuleren
  :resource-base (s-url "http://data.lblod.info/id/fracties/")
  :has-many `((bestuursorgaan :via ,(s-prefix "org:memberOf")
                              :as "bestuursorganen-in-tijd"))
  :has-one `((bestuurseenheid :via ,(s-prefix "org:linkedTo")
                              :as "bestuurseenheid")
             (fractietype :via ,(s-prefix "ext:isFractietype")
                          :as "fractietype"))
  :features '(include-uri)
  :on-path "fracties")

(define-resource fractietype ()
  :class (s-prefix "ext:Fractietype")
  :properties `((:label :string ,(s-prefix "skos:prefLabel"))
                (:scope-note :string ,(s-prefix "skos:scopeNote")))
  :resource-base (s-url "http://data.vlaanderen.be/id/concept/Fractietype/")
  :features '(include-uri)
  :on-path "fractietypes")

(define-resource geboorte ()
  :class (s-prefix "persoon:Geboorte")
  :properties `((:datum :date ,(s-prefix "persoon:datum")))
  :resource-base (s-url "http://data.lblod.info/id/geboortes/")
  :features '(include-uri)
  :on-path "geboortes")

(define-resource lidmaatschap ()
  :class (s-prefix "org:Membership")
  :has-one `((fractie :via ,(s-prefix "org:organisation")
                      :as "binnen-fractie")
             (mandataris :via ,(s-prefix "org:hasMembership")
                         :inverse t
                         :as "lid")
             (tijdsinterval :via ,(s-prefix "org:memberDuring")
                            :as "lid-gedurende"))
  :resource-base (s-url "http://data.lblod.info/id/lidmaatschappen/")
  :features '(include-uri)
  :on-path "lidmaatschappen")

(define-resource mandaat (post)
  :class (s-prefix "mandaat:Mandaat")
  :properties `((:aantal-houders :number ,(s-prefix "mandaat:aantalHouders")))
  :has-one `((bestuursfunctie-code :via ,(s-prefix "org:role")
                                   :as "bestuursfunctie"))
  :has-many `((bestuursorgaan :via ,(s-prefix "org:hasPost")
                              :inverse t
                              :as "bevat-in"))
  :resource-base (s-url "http://data.lblod.info/id/mandaten/")
  :features '(include-uri)
  :on-path "mandaten"
)

(define-resource bestuursfunctie-code ()
  :class (s-prefix "ext:BestuursfunctieCode")
  :properties `((:label :string ,(s-prefix "skos:prefLabel"))
                (:scope-note :string ,(s-prefix "skos:scopeNote")))
  :resource-base (s-url "http://data.vlaanderen.be/id/concept/BestuursfunctieCode/")
  :features '(include-uri)
  :on-path "bestuursfunctie-codes")

(define-resource mandataris (agent-in-position)
  :class (s-prefix "mandaat:Mandataris")
  :properties `((:rangorde :string ,(s-prefix "mandaat:rangorde"))
                (:start :datetime ,(s-prefix "mandaat:start"))
                (:einde :datetime ,(s-prefix "mandaat:einde"))
                (:datum-eedaflegging :datetime ,(s-prefix "ext:datumEedaflegging"))
                (:datum-ministrieel-besluit :datetime ,(s-prefix "ext:datumMinistrieelBesluit"))
                (:generated-from :uri-set ,(s-prefix "ext:generatedFrom")) ;;if it e.g. comes from gelinkt-notuleren
                (:duplication-reason :string ,(s-prefix "skos:changeNote")))
  :has-many `((mandataris :via ,(s-prefix "mandaat:isTijdelijkVervangenDoor")
                          :as "tijdelijke-vervangingen")
              (contact-point :via ,(s-prefix "schema:contactPoint")
                          :as "contact-points")
              (beleidsdomein-code :via ,(s-prefix "mandaat:beleidsdomein")
                                  :as "beleidsdomein"))
  :has-one `((mandaat :via ,(s-prefix "org:holds")
                      :as "bekleedt")
             (lidmaatschap :via ,(s-prefix "org:hasMembership")
                           :as "heeft-lidmaatschap")
             (persoon :via ,(s-prefix "mandaat:isBestuurlijkeAliasVan")
                      :as "is-bestuurlijke-alias-van")
             (mandataris-status-code :via ,(s-prefix "mandaat:status")
                                     :as "status")
             (mandataris :via ,(s-prefix "owl:sameAs")
                         :as "duplicate-of"))
  :resource-base (s-url "http://data.lblod.info/id/mandatarissen/")
  :features '(include-uri)
  :on-path "mandatarissen"
)

(define-resource mandataris-status-code ()
  :class (s-prefix "ext:MandatarisStatusCode")
  :properties `((:label :string ,(s-prefix "skos:prefLabel"))
                (:scope-note :string ,(s-prefix "skos:scopeNote")))
  :resource-base (s-url "http://data.vlaanderen.be/id/concept/MandatarisStatusCode/")
  :features '(include-uri)
  :on-path "mandataris-status-codes")

(define-resource beleidsdomein-code ()
  :class (s-prefix "ext:BeleidsdomeinCode")
  :properties `((:label :string ,(s-prefix "skos:prefLabel"))
                (:scope-note :string ,(s-prefix "skos:scopeNote")))
  :has-many `((mandataris :via ,(s-prefix "mandaat:beleidsdomein")
                          :inverse t
                          :as "mandatarissen"))
  :resource-base (s-url "http://data.vlaanderen.be/id/concept/BeleidsdomeinCode/")
  :features '(include-uri)
  :on-path "beleidsdomein-codes")

(define-resource persoon ()
  :class (s-prefix "person:Person")
  :properties `((:achternaam :string ,(s-prefix "foaf:familyName"))
                (:alternatieve-naam :string ,(s-prefix "foaf:name"))
                (:gebruikte-voornaam :string ,(s-prefix "persoon:gebruikteVoornaam")))
  :has-many `((mandataris :via ,(s-prefix "mandaat:isBestuurlijkeAliasVan")
                          :inverse t
                          :as "is-aangesteld-als")
              (nationality :via ,(s-prefix "persoon:heeftNationaliteit")
                            :as "nationalities"))
  :has-one `((geboorte :via ,(s-prefix "persoon:heeftGeboorte")
                       :as "geboorte")
             (identificator :via ,(s-prefix "adms:identifier")
                            :as "identificator")
             (geslacht-code :via ,(s-prefix "persoon:geslacht")
                            :as "geslacht"))
  :resource-base (s-url "http://data.lblod.info/id/personen/")
  :features '(include-uri)
  :on-path "personen")

(define-resource geslacht-code ()
  :class (s-prefix "ext:GeslachtCode")
  :properties `((:label :string ,(s-prefix "skos:prefLabel"))
                (:scope-note :string ,(s-prefix "skos:scopeNote")))
  :resource-base (s-url "http://data.vlaanderen.be/id/concept/GeslachtCode/")
  :features '(include-uri)
  :on-path "geslacht-codes")

(define-resource nationality ()
  :class (s-prefix "euvoc:Country")
  :properties `((:country-label :string ,(s-prefix "skos:prefLabel"))
                (:nationality-label :string ,(s-prefix "rdfs:label")))
  :resource-base (s-url "http://lblod.data.gift/concepts/")
  :features '(include-uri)
  :on-path "nationalities")

(define-resource identificator ()
  :class (s-prefix "adms:Identifier")
  :properties `((:identificator :string ,(s-prefix "skos:notation"))) ;; TODO: should have a specific type
  :resource-base (s-url "http://data.lblod.info/id/identificatoren/")
  :features '(include-uri)
  :on-path "identificatoren")

(define-resource tijdsinterval ()
  :class (s-prefix "dct:PeriodOfTime")
  :properties `((:begin :datetime ,(s-prefix "generiek:begin"))
                (:einde :datetime ,(s-prefix "generiek:einde")))
  :resource-base (s-url "http://data.lblod.info/id/tijdsintervallen/")
  :features '(include-uri)
  :on-path "tijdsintervallen")
