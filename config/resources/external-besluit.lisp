;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;; BESLUIT ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; this is a shared domain file, maintained in https://github.com/lblod/domain-files (file master-besluit-domain)
;; only part of the resources have been imported
;; in this file there have also been some additions to some resources.

(define-resource rechtsgrond ()
  :class (s-prefix "eli:LegalResource")
  :properties `(
    (:bekrachtigt-aanstelling-van :string ,(s-prefix "mandaat:bekrachtigtAanstellingVan"))
    (:bekrachtigt-ontslag-van :string ,(s-prefix "mandaat:bekrachtigtOntslagVan"))
    (:gepubliceerd-vanuit :string ,(s-prefix "prov:wasDerivedFrom"))
  )
  :resource-base (s-url "http://data.lblod.info/id/rechtsgronden/")
  :features '(include-uri)
  :on-path "rechtsgronden"
)

(define-resource artikel (rechtsgrond)
  :class (s-prefix "besluit:Artikel")
  :resource-base (s-url "http://data.lblod.info/id/artikels/")
  :features '(include-uri)
  :on-path "artikels"
)

(define-resource besluit (rechtsgrond)
  :class (s-prefix "besluit:Besluit")
  :properties `((:beschrijving :string ,(s-prefix "eli:description"))
                (:citeeropschrift :string ,(s-prefix "eli:title_short"))
                (:motivering :language-string ,(s-prefix "besluit:motivering"))
                (:publicatiedatum :date ,(s-prefix "eli:date_publication"))
                (:inhoud :string ,(s-prefix "prov:value"))
                (:taal :url ,(s-prefix "eli:language"))
                (:titel :string ,(s-prefix "eli:title"))
                (:score :float ,(s-prefix "nao:score")))
  :resource-base (s-url "http://data.lblod.info/id/besluiten/")
  :features '(include-uri)
  :on-path "besluiten")

(define-resource bestuurseenheid () ;; Subclass of m8g:PublicOrganisation, which is a subclass of dct:Agent
  :class (s-prefix "besluit:Bestuurseenheid")
  :properties `((:naam :string ,(s-prefix "skos:prefLabel"))
                (:alternatieve-naam :string-set ,(s-prefix "skos:altLabel"))
                (:is-faciliteiten-gemeente :boolean ,(s-prefix "lmb:faciliteitenGemeente"))
                (:mail-adres :string ,(s-prefix "ext:mailAdresVoorNotificaties"))
                (:hide-legislatuur :boolean ,(s-prefix "ext:voorbereidingVerborgen"))
                (:is-lokaal-beheerd :boolean ,(s-prefix "ext:isLokaalBeheerd")))
  :has-one `((werkingsgebied :via ,(s-prefix "besluit:werkingsgebied")
                             :as "werkingsgebied")
             (werkingsgebied :via ,(s-prefix "ext:inProvincie")
                             :as "provincie")
             (bestuurseenheid :via ,(s-prefix "ext:isOCMWVoor")
                              :as "is-ocmw-voor")
             (bestuurseenheid-classificatie-code :via ,(s-prefix "besluit:classificatie")
                                                 :as "classificatie")
             (bestuurseenheid-contact :via ,(s-prefix "ext:contactVoor")
                                          :inverse t
                                          :as "contact")
             (bestuurseenheid :via ,(s-prefix "org:linkedTo")
                                    :as "is-associated-with"))
  :has-many `((bestuursorgaan :via ,(s-prefix "besluit:bestuurt")
                              :inverse t
                              :as "bestuursorganen")
              (bestuursorgaan :via ,(s-prefix "ext:origineleBestuurseenheid")
                              :inverse t
                              :as "fake-bestuursorganen"))
  :resource-base (s-url "http://data.lblod.info/id/bestuurseenheden/")
  :features '(include-uri)
  :on-path "bestuurseenheden"
)

(define-resource werkingsgebied ()
  :class (s-prefix "prov:Location")
  :properties `((:naam :string ,(s-prefix "rdfs:label"))
                (:niveau :string, (s-prefix "ext:werkingsgebiedNiveau")))
  :has-many `((bestuurseenheid :via ,(s-prefix "besluit:werkingsgebied")
                               :inverse t
                               :as "bestuurseenheid"))
  :resource-base (s-url "http://data.lblod.info/id/werkingsgebieden/")
  :features '(include-uri)
  :on-path "werkingsgebieden")

(define-resource bestuurseenheid-classificatie-code ()
  :class (s-prefix "ext:BestuurseenheidClassificatieCode")
  :properties `((:label :string ,(s-prefix "skos:prefLabel")))
  :resource-base (s-url "http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/")
  :features '(include-uri)
  :on-path "bestuurseenheid-classificatie-codes")

(define-resource bestuurseenheid-contact ()
  :class (s-prefix "ext:BestuurseenheidContact")
  :properties `((:email :string ,(s-prefix "schema:email")))
  :resource-base (s-url "http://data.lblod.info/id/BestuurseenheidContact/")
  :features '(include-uri)
  :has-one `((bestuurseenheid :via ,(s-prefix "ext:contactVoor")
                              :as "bestuurseenheid"))
  :on-path "bestuurseenheid-contacten")

(define-resource bestuursorgaan ()
  :class (s-prefix "besluit:Bestuursorgaan")
  :properties `((:naam :string ,(s-prefix "skos:prefLabel"))
                (:deactivated-at :date ,(s-prefix "lmb:deactivatedAt"))
                (:binding-einde :date ,(s-prefix "mandaat:bindingEinde"))
                (:binding-start :date ,(s-prefix "mandaat:bindingStart")))
  :has-one `((bestuurseenheid :via ,(s-prefix "besluit:bestuurt")
                              :as "bestuurseenheid")
             (bestuurseenheid :via ,(s-prefix "ext:origineleBestuurseenheid")
                              :as "original-bestuurseenheid")
             (bestuurseenheid :via ,(s-prefix "ext:isTijdelijkOrgaanIn")
                              :as "tijdelijk-orgaan-in")
             (bestuursorgaan-classificatie-code :via ,(s-prefix "besluit:classificatie")
                                                :as "classificatie")
             (bestuursorgaan :via ,(s-prefix "mandaat:isTijdspecialisatieVan")
                             :as "is-tijdsspecialisatie-van")
             (bestuursorgaan :via ,(s-prefix "ext:origineleBestuursorgaan")
                              :as "original-bestuursorgaan")
             (bestuursperiode :via ,(s-prefix "lmb:heeftBestuursperiode")
                             :as "heeft-bestuursperiode")
             (rechtstreekse-verkiezing :via ,(s-prefix "mandaat:steltSamen")
                                       :inverse t
                                       :as "verkiezing"))
  :has-many `((bestuursorgaan :via ,(s-prefix "mandaat:isTijdspecialisatieVan")
                       :inverse t
                       :as "heeft-tijdsspecialisaties")
              (mandaat :via ,(s-prefix "org:hasPost")
                       :as "bevat"))
  :resource-base (s-url "http://data.lblod.info/id/bestuursorganen/")
  :features '(include-uri)
  :on-path "bestuursorganen")

(define-resource bestuursperiode (concept)
  :class (s-prefix "lmb:Bestuursperiode")
  :properties `((:start :integer ,(s-prefix "lmb:startYear"))
                (:einde :integer ,(s-prefix "lmb:endYear")))
  :has-many `((bestuursorgaan :via ,(s-prefix "lmb:heeftBestuursperiode")
                       :inverse t
                       :as "heeft-bestuursorganen-in-tijd")
             (installatievergadering :via ,(s-prefix "lmb:heeftBestuursperiode")
                       :inverse t
                       :as "installatievergaderingen"))
  :resource-base (s-url "http://data.vlaanderen.be/id/concept/Bestuursperiode/")
  :features '(include-uri)
  :on-path "bestuursperiodes")

(define-resource bestuursorgaan-classificatie-code ()
  :class (s-prefix "ext:BestuursorgaanClassificatieCode")
  :properties `((:label :string ,(s-prefix "skos:prefLabel")))
  :has-many `((bestuursfunctie-code :via ,(s-prefix "ext:hasDefaultType")
                        :as "standaard-type"))
  :resource-base (s-url "http://data.vlaanderen.be/id/concept/BestuursorgaanClassificatieCode/")
  :features '(include-uri)
  :on-path "bestuursorgaan-classificatie-codes")
