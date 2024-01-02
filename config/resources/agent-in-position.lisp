;; re-shuffle declaration of files, because
;; mu-resource 1.21.0 is sensible when files
;; are declared vs loaded the class hierarchy
;; hence this is a temporary workaround
;; ORDER REALLY MATTERS FOR NOW!

;;"RESHUFFLED" from worship-units.lisp
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

