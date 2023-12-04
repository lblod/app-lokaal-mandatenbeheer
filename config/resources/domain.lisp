(in-package :mu-cl-resources)

(defparameter *cache-count-queries* nil)
(defparameter *supply-cache-headers-p* t
  "when non-nil, cache headers are supplied.  this works together with mu-cache.")
(setf *cache-model-properties-p* t)
(defparameter *include-count-in-paginated-responses* t
  "when non-nil, all paginated listings will contain the number
   of responses in the result object's meta.")
(defparameter *max-group-sorted-properties* t)
(defparameter sparql:*experimental-no-application-graph-for-sudo-select-queries* t)
(setf *fetch-all-types-in-construct-queries* t)

;; Note: the organisation of the files is currently a bit of a mess.
;; Previously we ordered files by Application Profile/Model.
;; However since the introduction of inheritance of mu-resource
;; we had to shuffle the declaration of resources around
;; since there is a bug in mu-resource 1.21.0 that forces us
;; to declare the inheritance tree in one file.
;; This means that we had to break the content of some files
;; and move these to other files.
;; To track these resource, look for the files with comment "RESHUFFLED".

(read-domain-file "agent-in-position.lisp")
(read-domain-file "organisation.lisp")
(read-domain-file "concept-scheme.lisp")
(read-domain-file "post.lisp")
(read-domain-file "master-users-domain.lisp")
(read-domain-file "master-dynamic-forms-domain.lisp")
(read-domain-file "slave-mandaat-domain.lisp")
(read-domain-file "worship-units.lisp")
(read-domain-file "slave-besluit-domain.lisp")
(read-domain-file "master-submissions-domain.lisp")



;; Extra security layer to return 403 on GET /files
;; It should be ok for mu-auth; but devs can make bugs and add files to the wrong graph (i.e. public)
(before (:list file) (resource)
  (let ((request-filters-on-uri
          (some (lambda (args)
                  (let ((components (getf args :components)))

                    ;;matches /files?filter[data-container][input-from-tasks][:id:]=''
                    (or
                      (and (= 3 (length components))
                           (string= (elt components 2)
                                    ":id:"))

                     ;;matches /files?filter[:uri:]=''
                       (and (= 1 (length components))
                           (string= (elt components 0)
                                    ":uri:")))
                    ))
                (extract-filters-from-request))))
    (if request-filters-on-uri
        resource
        (error 'access-denied :operation :list :resource resource :id :none))))
