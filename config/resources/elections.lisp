;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;; Installatievergaderingen ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(define-resource installatievergadering ()
  :class (s-prefix "ext:Installatievergadering")
  :has-one `((installatievergadering-status :via ,(s-prefix "ext:hasInstallatievergaderingStatus")
                                            :as "status")
             (bestuursorgaan :via ,(s-prefix "ext:hasBestuursorgaanInDeTijd")
                             :as "bestuursorgaan-in-de-tijd"))
  :resource-base (s-url "http://data.lblod.info/id/Installatievergaderingen/")
  :features '(include-uri)
  :on-path "installatievergaderingen")

;; Possible statuses: teBehandelen, klaarVoorVergadering or behandeld
(define-resource installatievergadering-status ()
  :class (s-prefix "ext:InstallatievergaderingStatus")
  :properties `((:label :string ,(s-prefix "skos:prefLabel"))
                (:scope-note :string ,(s-prefix "skos:scopeNote")))
  :resource-base (s-url "http://data.lblod.info/id/InstallatievergaderingStatus/")
  :features '(include-uri)
  :on-path "installatievergadering-statussen")
