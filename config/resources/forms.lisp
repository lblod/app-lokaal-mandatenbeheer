(define-resource form ()
  ;; Not using form:Form here, as we are only providing a wrapper for it.
  ;; The actual form:Form is contained in the formTtl.
  :class (s-prefix "ext:Form")
  :properties `((:target-type :url ,(s-prefix "form:targetType"))
                (:target-label :uri-set ,(s-prefix "form:targetLabel"))
                (:prefix :url ,(s-prefix "ext:prefix"))
                (:id :string ,(s-prefix "mu:uuid"))
                (:form-ttl :string ,(s-prefix "ext:formTtl"))
                (:meta-ttl :string ,(s-prefix "ext:metaTtl"))
                (:modified :datetime ,(s-prefix "dct:modified")))
  :has-many `((form-extension :via ,(s-prefix "ext:extendsForm")
                              :inverse t
                              :as "extensions"))
  :resource-base (s-url "http://data.lblod.info/id/lmb/forms/")
  :on-path "forms"
)

(define-resource form-extension (form)
  :class (s-prefix "ext:Extension")
  :has-one `((form :via ,(s-prefix "ext:extendsForm")
                  :as "extends-form"))
  :resource-base (s-url "http://data.lblod.info/id/lmb/forms/")
  :on-path "form-extensions"
)