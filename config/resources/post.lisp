;; re-shuffle declaration of files, because
;; mu-resource 1.21.0 is sensible when files
;; are declared to load the class hierarchy
;; hence this is a temporary workaround
;; ORDER REALLY MATTERS FOR NOW!

;;"RESHUFFLED" from whorship-units.lisp
(define-resource post ()
  :class (s-prefix "org:Post")
  :has-one `((role :via ,(s-prefix "org:role")
                   :as "role")
             (organization :via ,(s-prefix "org:postIn")
                            :as "organization"))
  :has-many `((agent-in-position :via ,(s-prefix "org:holds")
                                 :inverse t
                                 :as "agents-in-position"))
  :resource-base (s-url "http://data.lblod.info/id/posities/")
  :features '(include-uri)
  :on-path "posts"
)

;;"RESHUFFLED" from slave-mandaat-domain.lisp
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