(define-resource concept-scheme ()
  :class (s-prefix "skos:ConceptScheme")
  :properties `(
              (:label :string ,(s-prefix "skos:prefLabel"))
              (:id :string ,(s-prefix "mu:uuid"))
              (:is-read-only :boolean ,(s-prefix "ext:isReadOnly"))
              (:created-at :datetime ,(s-prefix "dct:created")))
  :has-many `((concept :via ,(s-prefix "skos:inScheme")
                       :inverse t
                       :as "concepts")
              (concept :via ,(s-prefix "skos:topConceptOf")
                       :inverse t
                       :as "top-concepts"))
  :resource-base (s-url "http://lblod.data.gift/concept-schemes/")
  :features `(include-uri)
  :on-path "concept-schemes"
)

(define-resource concept ()
  :class (s-prefix "skos:Concept")
  :properties `(
              (:label :string ,(s-prefix "skos:prefLabel"))
              (:order :string ,(s-prefix "sh:order"))
              (:id :string ,(s-prefix "mu:uuid")))
  :has-many `((concept-scheme :via ,(s-prefix "skos:inScheme")
                              :as "concept-schemes")
              (concept-scheme :via ,(s-prefix "skos:topConceptOf")
                              :as "top-concept-schemes"))
  :resource-base (s-url "http://lblod.data.gift/concepts/")
  :features `(include-uri)
  :on-path "concepts"
)