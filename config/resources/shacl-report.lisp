(define-resource report ()
  :class (s-prefix "sh:ValidationReport")
  :properties `((:created :string ,(s-prefix "dct:created"))
                (:conforms :boolean ,(s-prefix "sh:conforms")))
  :has-many `((validationresult :via ,(s-prefix "sh:result")
                              :as "validationresults"))
  :resource-base (s-url "http://data.lblod.info/id/reports/")
  :on-path "reports"
)

(define-resource validationresult ()
  :class (s-prefix "sh:ValidationResult")
  :properties `((:focusNode :uri ,(s-prefix "sh:focusNode"))
                (:resultSeverity :uri ,(s-prefix "sh:resultSeverity"))
                (:sourceConstraintComponent :uri ,(s-prefix "sh:sourceConstraintComponent"))
                (:sourceShape :uri ,(s-prefix "sh:sourceShape"))
                (:resultMessage :string ,(s-prefix "sh:resultMessage"))
                (:value :string ,(s-prefix "sh:value"))
                (:targetClassOfFocusNode :uri ,(s-prefix "lmb:targetClassOfFocusNode"))
                )
  :resource-base (s-url "http://data.lblod.info/id/validationresults/")
  :on-path "validationresults"
)

