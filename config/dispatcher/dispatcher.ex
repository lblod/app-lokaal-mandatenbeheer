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
  match "/bestuurseenheden/*path", %{layer: :resources, accept: %{json: true}} do
    forward(conn, path, "http://cache/bestuurseenheden/")
  end

  match "/werkingsgebieden/*path", %{layer: :resources, accept: %{json: true}} do
    forward(conn, path, "http://cache/werkingsgebieden/")
  end

  match "/bestuurseenheid-classificatie-codes/*path", %{layer: :resources, accept: %{json: true}} do
    forward(conn, path, "http://cache/bestuurseenheid-classificatie-codes/")
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

  match "/tijdsintervallen/*path", %{layer: :resources, accept: %{json: true}} do
    forward(conn, path, "http://cache/tijdsintervallen/")
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
  # Leidinggevenden resources
  #################################################################
  match "/bestuursfuncties/*path", %{layer: :resources, accept: %{json: true}} do
    forward(conn, path, "http://cache/bestuursfuncties/")
  end

  match "/functionarissen/*path", %{layer: :resources, accept: %{json: true}} do
    forward(conn, path, "http://cache/functionarissen/")
  end

  match "/functionaris-status-codes/*path", %{layer: :resources, accept: %{json: true}} do
    forward(conn, path, "http://cache/functionaris-status-codes/")
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
  get "/concept-schemes/*path", %{layer: :resources, accept: %{json: true}} do
    forward(conn, path, "http://cache/concept-schemes/")
  end

  get "/concepts/*path", %{layer: :resources, accept: %{json: true}} do
    forward(conn, path, "http://cache/concepts/")
  end

  #################################################################
  # File logic + resources
  #################################################################
  patch "/files/*path", %{layer: :resources, accept: %{json: true}} do
    forward(conn, path, "http://resource/files/")
  end

  post "/files/*path", %{layer: :resources, accept: %{json: true}} do
    forward(conn, path, "http://file/files/")
  end

  # TODO: find all usage of this endpoint and replace it with `POST /files`
  # This is kept to maintain compatibility with code that uses the "old" endpoint.
  post "/file-service/files/*path", %{layer: :resources, accept: %{json: true}} do
    forward(conn, path, "http://file/files/")
  end

  delete "/files/*path", %{layer: :resources, accept: %{json: true}} do
    forward(conn, path, "http://file/files/")
  end

  match "/file-addresses/*path", %{layer: :resources, accept: %{json: true}} do
    forward(conn, path, "http://resource/file-addresses/")
  end

  get "/files/:id/download", %{layer: :resources, accept: %{any: true}} do
    forward(conn, [], "http://file/files/" <> id <> "/download")
  end

  get "/files/*path", %{layer: :resources, accept: %{any: true}} do
    forward(conn, path, "http://resource/files/")
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

  match "/sessions/*path", %{layer: :resources, accept: %{any: true}} do
    Proxy.forward(conn, path, "http://login/sessions/")
  end

  #################################################################
  # Extra services
  #################################################################
  delete "/mandatarissen/:id", %{layer: :api_services, accept: %{any: true}} do
    forward(conn, [], "http://mandataris-archive/" <> id <> "/archive")
  end

  match "/rrn/*path", %{layer: :api_services, accept: %{any: true}} do
    forward(conn, path, "http://person-uri-for-social-security-number/")
  end

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

  match "/form-extensions/*path", %{layer: :resources, accept: %{json: true}} do
    forward(conn, path, "http://cache/form-extensions/")
  end

  #################################################################
  # Mandataris api
  #################################################################

  match "/mandataris-api/*path", %{layer: :api_services, accept: %{any: true}} do
    forward(conn, path, "http://mandataris/")
  end

  #################################################################
  # LDES
  #################################################################
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
