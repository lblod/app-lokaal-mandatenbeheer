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
