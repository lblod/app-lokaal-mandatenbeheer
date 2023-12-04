(define-resource vendor ()
  :class (s-prefix "ext:Vendor") ; Subclass of foaf:Agent
  :properties `((:name :string ,(s-prefix "foaf:name"))
                (:key :string ,(s-prefix "muAccount:key")))
  :has-many `((bestuurseenheid :via ,(s-prefix "muAccount:canActOnBehalfOf")
                    :as "can-act-on-behalf-of"))
  :resource-base (s-url "http://data.lblod.info/vendors/")
  :features `(include-uri)
  :on-path "vendors")