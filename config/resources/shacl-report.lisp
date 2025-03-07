(define-resource report ()
  :class (s-prefix "sh:ValidationReport")
  :properties `((:created :datetime ,(s-prefix "dct:created"))
                (:conforms :boolean ,(s-prefix "sh:conforms")))
  :has-many `((validationresult :via ,(s-prefix "sh:result")
                              :as "validationresults"))
  :resource-base (s-url "http://data.lblod.info/id/reports/")
  :features '(include-uri)
  :on-path "reports"
)

(define-resource validationresult ()
  :class (s-prefix "sh:ValidationResult")
  :properties `((:focus-node :string ,(s-prefix "sh:focusNode"))
                ;; else we would need a polymorphic relation of any type and I don't think resources can do that
                (:focus-node-id :string ,(s-prefix "lmb:targetIdOfFocusNode"))
                (:result-severity :string ,(s-prefix "sh:resultSeverity"))
                (:source-constraint-component :string ,(s-prefix "sh:sourceConstraintComponent"))
                (:source-shape :string ,(s-prefix "sh:sourceShape"))
                (:result-message :string ,(s-prefix "sh:resultMessage"))
                (:result-path :string ,(s-prefix "sh:resultPath"))
                (:value :string ,(s-prefix "sh:value"))
                (:target-class-of-focus-node :string ,(s-prefix "lmb:targetClassOfFocusNode"))
                )
  :resource-base (s-url "http://data.lblod.info/id/validationresults/")
  :features '(include-uri)
  :on-path "validationresults"
)

