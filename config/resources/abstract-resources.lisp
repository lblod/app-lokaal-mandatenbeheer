;; This class contains some superclasses used in mandatenbeheer.

(define-resource agent-in-position ()
  :class (s-prefix "ch:AgentInPositie")
  :properties `((:agent-start-date :date ,(s-prefix "ch:startdatum"))
                (:agent-end-date :date ,(s-prefix "ch:eindedatum")))
  :has-one `((post :via ,(s-prefix "org:holds")
                   :as "post")
             (persoon :via ,(s-prefix "org:heldBy")
                      :as "person")
             ;;NOTE: this relation belongs to a child class
             ;; This is a workaround to allow filtering on properties of child-class, which come through the parent-class.
             (persoon :via ,(s-prefix "mandaat:isBestuurlijkeAliasVan")
                      :as "is-bestuurlijke-alias-van")
             )
  :has-many `((contact-punt :via ,(s-prefix "schema:contactPoint")
                            :as "contacts"))
  :resource-base (s-url "http://data.lblod.info/id/agentenInPositie/")
  :features '(include-uri)
  :on-path "agents-in-position"
)

(define-resource post ()
  :class (s-prefix "org:Post")
  :has-one `((role :via ,(s-prefix "org:role")
                   :as "role"))
  :has-many `((agent-in-position :via ,(s-prefix "org:holds")
                                 :inverse t
                                 :as "agents-in-position"))
  :resource-base (s-url "http://data.lblod.info/id/posities/")
  :features '(include-uri)
  :on-path "posts"
)

(define-resource role ()
  :class (s-prefix "org:Role")
  :properties `((:label :string ,(s-prefix "skos:prefLabel")))
  :resource-base (s-url "http://data.lblod.info/id/rollen/")
  :features '(include-uri)
  :on-path "roles"
)

;; TODO define field, group, generator resources
(define-resource form ()
  :class (s-prefix "form:Form")
  :properties `((:target-type :url ,(s-prefix "form:targetType"))
                (:target-label :uri-set ,(s-prefix "form:targetLabel"))
                (:prefix :url ,(s-prefix "ext:prefix"))
                (:id :string ,(s-prefix "mu:uuid")))  
  :has-many `((field :via ,(s-prefix "form:includes")
                        :as "fields")
              (group :via ,(s-prefix "sh:group")
                      :as "groups")
              (generator :via ,(s-prefix "form:initGenerator")
                      :as "generators"))
  :resource-base (s-url "http://data.lblod.info/id/lmb/forms/")
  :on-path "forms"
)

(define-resource form-extension (form)
  :class (s-prefix "form:Extension")
  :properties `((:extends-form :url ,(s-prefix "ext:extendsForm")))  
  :resource-base (s-url "http://data.lblod.info/id/lmb/forms/")
  :on-path "form-extensions"
)