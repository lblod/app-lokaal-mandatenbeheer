(define-resource form ()
  ;; Not using form:Form here, as we are only providing a wrapper for it.
  ;; The actual form:Form is contained in the formTtl.
  :class (s-prefix "form:Form")
  :properties `((:target-type :url ,(s-prefix "form:targetType"))
                (:target-label :uri-set ,(s-prefix "form:targetLabel"))
                (:prefix :url ,(s-prefix "ext:prefix"))
                (:id :string ,(s-prefix "mu:uuid"))
                (:form-ttl :string ,(s-prefix "ext:formTtl"))
                (:meta-ttl :string ,(s-prefix "ext:metaTtl")))
  :has-many `((form-extension :via ,(s-prefix "ext:extendsForm")
                              :inverse t
                              :as "extensions"))
  :resource-base (s-url "http://data.lblod.info/id/lmb/forms/")
  :on-path "forms"
)

(define-resource generated-form (form)
  :class (s-prefix "ext:GeneratedForm")
  :properties `((:id :string ,(s-prefix "mu:uuid"))
              (:created-at :datetime ,(s-prefix "dct:created"))
              (:modified-at :datetime ,(s-prefix "dct:modified"))
              (:name :string ,(s-prefix "skos:prefLabel"))
              (:description :string ,(s-prefix "dct:description"))
              (:base-form :string ,(s-prefix "ext:extendsForm")))
  :resource-base (s-url "http://data.lblod.info/id/lmb/generated-forms/")
  :on-path "generated-forms"
)

(define-resource form-extension (form)
  :class (s-prefix "form:Extension")
  :has-one `((form :via ,(s-prefix "ext:extendsForm")
                  :as "extends-form"))
  :resource-base (s-url "http://data.lblod.info/id/lmb/forms/")
  :on-path "form-extensions"
)

(define-resource form-field ()
  :class (s-prefix "form:Field")
  :properties `((:name :string ,(s-prefix "sh:name"))
                (:order :number ,(s-prefix "sh:order"))
                ;; this does not allow for nested paths, only direct properties. See if we can work around that? e.g. for address
                (:path :url ,(s-prefix "sh:path"))
                ;; json encoded options :(
                (:options :string ,(s-prefix "form:options")))
  ;; simplification, should be part of group and then form but that will be too complicated for our users
  :has-one `((form-extension :via ,(s-prefix "ext:partOfForm")
                   :as "form")
              (display-type :via ,(s-prefix "form:displayType")
                            :as "display-type")
              (library-entry :via ,(s-prefix "prov:wasDerivedFrom")
                             :as "library-entry"))
  :resource-base (s-url "http://data.lblod.info/id/lmb/form-fields/")
  :on-path "form-fields"
)

(define-resource display-type ()
  :class (s-prefix "ext:DisplayType")
  :properties `((:label :string ,(s-prefix "skos:prefLabel")))
  :resource-base (s-url "http://data.lblod.info/id/concept/DisplayType/")
  :features '(include-uri)
  :on-path "display-types"
)

(define-resource library-entry ()
  :class (s-prefix "ext:FormLibraryEntry")
  :properties `((:name :string ,(s-prefix "sh:name"))
                (:order :number ,(s-prefix "sh:order"))
                ;; this does not allow for nested paths, only direct properties. See if we can work around that? e.g. for address
                (:path :url ,(s-prefix "sh:path"))
                ;; json encoded options :(
                (:options :string ,(s-prefix "form:options")))
  ;; simplification, should be part of group and then form but that will be too complicated for our users
  :has-one `((display-type :via ,(s-prefix "form:displayType")
                            :as "display-type"))
  :resource-base (s-url "http://data.lblod.info/id/lmb/form-library-entries/")
  :features '(include-uri)
  :on-path "library-entries"
)

(define-resource library ()
  :class (s-prefix "ext:FormLibrary")
  :properties `((:name :string ,(s-prefix "dct:title")))
  :has-many `((library-entry :via ,(s-prefix "ext:hasLibraryEntry")
                             :as "entries"))
  :resource-base (s-url "http://data.lblod.info/id/lmb/form-libraries/")
  :features '(include-uri)
  :on-path "libraries"
)

