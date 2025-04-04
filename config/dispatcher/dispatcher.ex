defmodule Dispatcher do
  use Matcher

  define_accept_types(
    json: ["application/json", "application/vnd.api+json"],
    html: ["text/html", "application/xhtml+html"],
    sparql: ["application/sparql-results+json"],
    any: ["*/*"]
  )

  define_layers([:static, :sparql, :api_services, :frontend_fallback, :resources, :not_found])

  options "/*path", _ do
    conn
    |> Plug.Conn.put_resp_header("access-control-allow-headers", "content-type,accept")
    |> Plug.Conn.put_resp_header("access-control-allow-methods", "*")
    |> send_resp(200, "{ \"message\": \"ok\" }")
  end

  ###############
  # STATIC
  ###############

  # self-service
  match "/index.html", %{layer: :static} do
    forward(conn, [], "http://frontend/index.html")
  end

  get "/assets/*path", %{layer: :static} do
    forward(conn, path, "http://frontend/assets/")
  end

  get "/@appuniversum/*path", %{layer: :static} do
    forward(conn, path, "http://frontend/@appuniversum/")
  end

  #################
  # FRONTEND PAGES
  #################

  # self-service
  match "/*path", %{layer: :frontend_fallback, accept: %{html: true}} do
    # we don't forward the path, because the app should take care of this in the browser.
    forward(conn, [], "http://frontend/index.html")
  end

  # match "/favicon.ico", @any do
  #   send_resp( conn, 404, "" )
  # end

  ###############
  # RESOURCES
  ###############

  match "/remote-data-objects/*path", %{layer: :resources, accept: %{json: true}} do
    Proxy.forward(conn, path, "http://resource/remote-data-objects/")
  end

  #################################################################
  # Abstract resources
  #################################################################
  match "/agents-in-position/*path", %{layer: :resources, accept: %{json: true}} do
    forward(conn, path, "http://cache/agents-in-position/")
  end

  match "/posts/*path", %{layer: :resources, accept: %{json: true}} do
    forward(conn, path, "http://cache/posts/")
  end

  match "/roles/*path", %{layer: :resources, accept: %{json: true}} do
    forward(conn, path, "http://cache/roles/")
  end

  #################################################################
  # Besluit resources
  #################################################################
  match "/besluiten/*path", %{layer: :resources, accept: %{json: true}} do
    forward(conn, path, "http://cache/besluiten/")
  end

  match "/bestuurseenheden/*path", %{layer: :resources, accept: %{json: true}} do
    forward(conn, path, "http://cache/bestuurseenheden/")
  end

  match "/werkingsgebieden/*path", %{layer: :resources, accept: %{json: true}} do
    forward(conn, path, "http://cache/werkingsgebieden/")
  end

  match "/bestuurseenheid-classificatie-codes/*path", %{layer: :resources, accept: %{json: true}} do
    forward(conn, path, "http://cache/bestuurseenheid-classificatie-codes/")
  end

  match "/bestuurseenheid-contacten/*path", %{layer: :resources, accept: %{json: true}} do
    forward(conn, path, "http://cache/bestuurseenheid-contacten/")
  end

  match "/bestuursorganen/*path", %{layer: :resources, accept: %{json: true}} do
    forward(conn, path, "http://cache/bestuursorganen/")
  end

  match "/bestuursperiodes/*path", %{layer: :resources, accept: %{json: true}} do
    forward(conn, path, "http://cache/bestuursperiodes/")
  end

  match "/bestuursorgaan-classificatie-codes/*path", %{layer: :resources, accept: %{json: true}} do
    forward(conn, path, "http://cache/bestuursorgaan-classificatie-codes/")
  end

  #################################################################
  # Mandaat resources
  #################################################################
  match "/besluiten/*path", %{layer: :resources, accept: %{json: true}} do
    forward(conn, path, "http://cache/besluiten/")
  end
  match "/artikels/*path", %{layer: :resources, accept: %{json: true}} do
    forward(conn, path, "http://cache/artikels/")
  end
  match "/rechtsgronden/*path", %{layer: :resources, accept: %{json: true}} do
    forward(conn, path, "http://cache/rechtsgronden/")
  end
  match "/fracties/*path", %{layer: :resources, accept: %{json: true}} do
    forward(conn, path, "http://cache/fracties/")
  end

  match "/fractietypes/*path", %{layer: :resources, accept: %{json: true}} do
    forward(conn, path, "http://cache/fractietypes/")
  end

  match "/geboortes/*path", %{layer: :resources, accept: %{json: true}} do
    forward(conn, path, "http://cache/geboortes/")
  end

  match "/lidmaatschappen/*path", %{layer: :resources, accept: %{json: true}} do
    forward(conn, path, "http://cache/lidmaatschappen/")
  end

  match "/mandaten/*path", %{layer: :resources, accept: %{json: true}} do
    forward(conn, path, "http://cache/mandaten/")
  end

  match "/bestuursfunctie-codes/*path", %{layer: :resources, accept: %{json: true}} do
    forward(conn, path, "http://cache/bestuursfunctie-codes/")
  end

  match "/mandatarissen/*path", %{layer: :resources, accept: %{json: true}} do
    forward(conn, path, "http://cache/mandatarissen/")
  end

  match "/mandataris-status-codes/*path", %{layer: :resources, accept: %{json: true}} do
    forward(conn, path, "http://cache/mandataris-status-codes/")
  end

  match "/mandataris-publication-status-codes/*path", %{layer: :resources, accept: %{json: true}} do
    forward(conn, path, "http://cache/mandataris-publication-status-codes/")
  end

  match "/beleidsdomein-codes/*path", %{layer: :resources, accept: %{json: true}} do
    forward(conn, path, "http://cache/beleidsdomein-codes/")
  end

  match "/personen/*path", %{layer: :resources, accept: %{json: true}} do
    forward(conn, path, "http://cache/personen/")
  end

  match "/geslacht-codes/*path", %{layer: :resources, accept: %{json: true}} do
    forward(conn, path, "http://cache/geslacht-codes/")
  end

  match "/nationalities/*path", %{layer: :resources, accept: %{json: true}} do
    Proxy.forward(conn, path, "http://cache/nationalities/")
  end

  match "/identificatoren/*path", %{layer: :resources, accept: %{json: true}} do
    forward(conn, path, "http://cache/identificatoren/")
  end

  #################################################################
  # Contact resources
  #################################################################
  match "/contact-punten/*path", %{layer: :resources, accept: %{json: true}} do
    forward(conn, path, "http://cache/contact-punten/")
  end

  match "/adressen/*path", %{layer: :resources, accept: %{json: true}} do
    forward(conn, path, "http://cache/adressen/")
  end

  #################################################################
  # Verkiezingen resources
  #################################################################

  match "/installatievergaderingen/*path", %{layer: :resources, accept: %{json: true}} do
    forward(conn, path, "http://cache/installatievergaderingen/")
  end

  match "/installatievergadering-statussen/*path", %{layer: :resources, accept: %{json: true}} do
    forward(conn, path, "http://cache/installatievergadering-statussen/")
  end

  match "/rechtstreekse-verkiezingen/*path", %{layer: :resources, accept: %{json: true}} do
    forward(conn, path, "http://cache/rechtstreekse-verkiezingen/")
  end

  match "/kandidatenlijsten/*path", %{layer: :resources, accept: %{json: true}} do
    forward(conn, path, "http://cache/kandidatenlijsten/")
  end

  match "/lijsttypes/*path", %{layer: :resources, accept: %{json: true}} do
    forward(conn, path, "http://cache/lijsttypes/")
  end

  match "/verkiezingsresultaten/*path", %{layer: :resources, accept: %{json: true}} do
    forward(conn, path, "http://cache/verkiezingsresultaten/")
  end

  match "/verkiezingsresultaat-gevolg-codes/*path", %{layer: :resources, accept: %{json: true}} do
    forward(conn, path, "http://cache/verkiezingsresultaat-gevolg-codes/")
  end

  #################################################################
  # Concept scheme resources
  #################################################################
  match "/concept-scheme-api/*path", %{layer: :api_services, accept: %{any: true}} do
    forward(conn, path, "http://concept-scheme/")
  end

  delete "/concept-schemes/:id", %{layer: :api_services, accept: %{json: true}} do
    forward(conn, [], "http://concept-scheme-api/concept-scheme/" <> id)
  end

  delete "/concepts/:id", %{layer: :api_services, accept: %{json: true}} do
    forward(conn, [], "http://concept-scheme-api/concept/" <> id)
  end

  match "/concept-schemes/*path", %{layer: :resources, accept: %{json: true}} do
    forward(conn, path, "http://cache/concept-schemes/")
  end

  match "/concepts/*path", %{layer: :resources, accept: %{json: true}} do
    forward(conn, path, "http://cache/concepts/")
  end

  #################################################################
  # System notification
  #################################################################
  match "/system-notifications/*path", %{layer: :resources, accept: %{json: true}} do
    forward(conn, path, "http://cache/system-notifications/")
  end

  match "/global-system-messages/*path", %{layer: :resources, accept: %{json: true}} do
    forward(conn, path, "http://cache/global-system-messages/")
  end

  #################################################################
  # File logic + resources
  #################################################################
  patch "/files/*path", %{layer: :resources, accept: %{json: true}} do
    forward(conn, path, "http://resource/files/")
  end

  post "/burgemeester-benoeming/*path", %{ layer: :api_services } do
    forward(conn, path, "http://mandataris/burgemeester-benoeming/")
  end

  post "/installatievergadering-api/*path", %{ layer: :api_services } do
    forward(conn, path, "http://mandataris/installatievergadering-api/")
  end

  get "/election-results-api/*path", %{ layer: :api_services, accept: %{any: true} } do
    forward(conn, path, "http://mandataris/election-results-api/")
  end

  post "/files/*path", %{ layer: :api_services } do
    forward(conn, path, "http://file/files/")
  end

  delete "/files/*path", %{ accept: [ :json ], layer: :api_services } do
    forward(conn, path, "http://file/files/")
  end

  match "/file-addresses/*path", %{layer: :resources, accept: %{json: true}} do
    forward(conn, path, "http://resource/file-addresses/")
  end

  get "/files/:id/download", %{layer: :api_services, accept: %{any: true}} do
    forward(conn, [], "http://file/files/" <> id <> "/download")
  end

  get "/files/*path", %{layer: :resources, accept: %{any: true}} do
    forward(conn, path, "http://resource/files/")
  end

   #################################################################
  # Reporting resources
  #################################################################
  match "/reports/*path", %{layer: :resources, accept: %{json: true}} do
    forward(conn, path, "http://cache/reports/")
  end

  match "/validationresults/*path", %{layer: :resources, accept: %{json: true}} do
    forward(conn, path, "http://cache/validationresults/")
  end

  #################################################################
  # Login logic
  #################################################################
  match "/mock/sessions/*path" do
    forward(conn, path, "http://mocklogin/sessions/")
  end

  match "/gebruikers/*path", %{layer: :resources, accept: %{any: true}} do
    forward(conn, path, "http://cache/gebruikers/")
  end

  match "/accounts/*path", %{layer: :resources, accept: %{any: true}} do
    forward(conn, path, "http://cache/accounts/")
  end

  match "/sessions/*path", %{layer: :api_services, accept: %{any: true}} do
    Proxy.forward(conn, path, "http://login/sessions/")
  end

  match "/impersonations/*path" do
    forward conn, path, "http://impersonation/impersonations/"
  end

  #################################################################
  # Extra services
  #################################################################
  match "/form-content/*path", %{layer: :api_services, accept: %{any: true}} do
    forward(conn, path, "http://form-content/")
  end

  match "/adressenregister/*path" do
    forward(conn, path, "http://adressenregister/")
  end

  #################################################################
  # Forms
  #################################################################

  match "/forms/*path", %{layer: :resources, accept: %{json: true}} do
    forward(conn, path, "http://cache/forms/")
  end

  match "/generated-forms/*path", %{layer: :resources, accept: %{json: true}} do
    forward(conn, path, "http://cache/generated-forms/")
  end

  match "/form-extensions/*path", %{layer: :resources, accept: %{json: true}} do
    forward(conn, path, "http://cache/form-extensions/")
  end

  match "/libraries/*path", %{layer: :resources, accept: %{json: true}} do
    forward(conn, path, "http://cache/libraries/")
  end

  match "/library-entries/*path", %{layer: :resources, accept: %{json: true}} do
    forward(conn, path, "http://cache/library-entries/")
  end

  match "/display-types/*path", %{layer: :resources, accept: %{json: true}} do
    forward(conn, path, "http://cache/display-types/")
  end

  match "/form-fields/*path", %{layer: :resources, accept: %{json: true}} do
    forward(conn, path, "http://cache/form-fields/")
  end

  #################################################################
  # Mandataris api
  #################################################################

  match "/mandataris-api/*path", %{layer: :api_services, accept: %{any: true}} do
    forward(conn, path, "http://mandataris/")
  end

  delete "/mandatarissen/:id", %{layer: :api_services, accept: %{json: true}} do
    forward(conn, [], "http://mandataris/mandatarissen/" <> id)
  end

  delete "/fracties/:id", %{layer: :api_services, accept: %{json: true}} do
    forward(conn, [], "http://mandataris/fracties/" <> id)
  end

  #################################################################
  # LDES
  #################################################################
  get "/streams/ldes/checkpoints/abb/*path" do
    forward(conn, path, "http://ldes-delta-pusher/checkpoints/abb/")
  end

  get "/streams/ldes/checkpoints/internal/*path" do
    forward(conn, path, "http://ldes-delta-pusher/checkpoints/internal/")
  end

  get "/streams/ldes/checkpoints/public/*path" do
    forward(conn, path, "http://ldes-delta-pusher/checkpoints/public/")
  end

  get "/streams/ldes/abb/*path" do
    forward(conn, path, "http://authorization-wrapper/abb/")
  end
  get "/streams/ldes/internal/*path" do
    forward(conn, path, "http://authorization-wrapper/internal/")
  end

  get "/streams/ldes/*path" do
    forward(conn, path, "http://ldes-backend")
  end

  #################################################################
  # Vendor Login for SPARQL endpoint
  #################################################################

  post "/vendor/login/*path" do
    Proxy.forward(conn, path, "http://vendor-login/sessions")
  end

  delete "/vendor/logout" do
    Proxy.forward(conn, [], "http://vendor-login/sessions/current")
  end

  #################################################################
  # Vendor SPARQL endpoint
  #################################################################

  # Not only POST. SPARQL via GET is also allowed.
  match "/vendor/sparql" do
    Proxy.forward(conn, [], "http://sparql-authorization-wrapper/sparql")
  end

  #################
  # NOT FOUND
  #################
  match "/*_path", %{layer: :not_found} do
    send_resp(conn, 404, "Route not found.  See config/dispatcher.ex")
  end
end
