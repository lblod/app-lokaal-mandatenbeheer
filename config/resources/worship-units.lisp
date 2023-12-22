(define-resource role ()
  :class (s-prefix "org:Role")
  :properties `((:label :string ,(s-prefix "skos:prefLabel")))
  :resource-base (s-url "http://data.lblod.info/id/rollen/")
  :features '(include-uri)
  :on-path "roles"
)

(define-resource site ()
  :class (s-prefix "org:Site")
  :has-one `((adres :via ,(s-prefix "organisatie:bestaatUit")
                    :as "address")
             (site-type :via ,(s-prefix "ere:vestigingstype")
                        :as "site-type"))
  :has-many `((contact-punt :via ,(s-prefix "org:siteAddress")
                            :as "contacts"))
  :resource-base (s-url "http://data.lblod.info/id/vestigingen/")
  :features '(include-uri)
  :on-path "sites"
)

(define-resource site-type ()
  :class (s-prefix "code:TypeVestiging")
  :properties `((:label :string ,(s-prefix "skos:prefLabel")))
  :resource-base (s-url "http://lblod.data.gift/concepts/")
  :features '(include-uri)
  :on-path "site-types"
)

(define-resource participation ()
  :class (s-prefix "m8g:Participation")
  :properties `((:description :string ,(s-prefix "dct:description"))
                (:role :url ,(s-prefix "m8g:role"))
                (:identifier :string ,(s-prefix "dct:identifier")))
  :has-one `((bestuurseenheid :via ,(s-prefix "m8g:playsRole")
                            :inverse t
                            :as "participating-bestuurseenheid"))
  :has-many `((agents :via ,(s-prefix "m8g:playsRole")
                             :inverse t
                             :as "participating-agents")
              (roles :via ,(s-prefix "m8g:role")
                             :as "roles"))
  :resource-base (s-url "http://data.lblod.info/id/participations/")
  :features '(include-uri)
  :on-path "participations"
)
