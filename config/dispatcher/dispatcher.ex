defmodule Dispatcher do
  use Matcher
  define_accept_types []

  # In order to forward the 'themes' resource to the
  # resource service, use the following forward rule.
  #
  # docker-compose stop; docker-compose rm; docker-compose up
  # after altering this file.
  #
  # match "/themes/*path" do
  #   forward conn, path, "http://resource/themes/"
  # end

  match "/bestuurseenheden/*path" do
    forward conn, path, "http://cache/bestuurseenheden/"
  end
  match "/werkingsgebieden/*path" do
    forward conn, path, "http://cache/werkingsgebieden/"
  end
  match "/bestuurseenheid-classificatie-codes/*path" do
    forward conn, path, "http://cache/bestuurseenheid-classificatie-codes/"
  end
  match "/bestuursorganen/*path" do
    forward conn, path, "http://cache/bestuursorganen/"
  end
  match "/bestuursorgaan-classificatie-codes/*path" do
    forward conn, path, "http://cache/bestuursorgaan-classificatie-codes/"
  end
  match "/fracties/*path" do
    forward conn, path, "http://cache/fracties/"
  end
  match "/fractietypes/*path" do
    forward conn, path, "http://cache/fractietypes/"
  end
  match "/geboortes/*path" do
    forward conn, path, "http://cache/geboortes/"
  end
  match "/lijsttypes/*path" do
    forward conn, path, "http://cache/lijsttypes/"
  end
  match "/kandidatenlijsten/*path" do
    forward conn, path, "http://cache/kandidatenlijsten/"
  end
  match "/lidmaatschappen/*path" do
    forward conn, path, "http://cache/lidmaatschappen/"
  end
  match "/mandaten/*path" do
    forward conn, path, "http://cache/mandaten/"
  end
  match "/bestuursfunctie-codes/*path" do
    forward conn, path, "http://cache/bestuursfunctie-codes/"
  end
  delete "/mandatarissen/:id" do
    forward conn, [], "http://mandataris-archive/" <> id <> "/archive"
  end
  match "/mandatarissen/*path" do
    forward conn, path, "http://cache/mandatarissen/"
  end
  match "/mandataris-status-codes/*path" do
    forward conn, path, "http://cache/mandataris-status-codes/"
  end
  match "/beleidsdomein-codes/*path" do
    forward conn, path, "http://cache/beleidsdomein-codes/"
  end
  match "/personen/*path" do
    forward conn, path, "http://cache/personen/"
  end
  match "/geslacht-codes/*path" do
    forward conn, path, "http://cache/geslacht-codes/"
  end

  match "/nationalities/*path" do
    Proxy.forward conn, path, "http://cache/nationalities/"
  end

  match "/identificatoren/*path" do
    forward conn, path, "http://cache/identificatoren/"
  end

  match "/tijdsintervallen/*path" do
    forward conn, path, "http://cache/tijdsintervallen/"
  end

  match "/mock/sessions/*path" do
    forward conn, path, "http://mocklogin/sessions/"
  end
  match "/sessions/*path" do
    forward conn, path, "http://login/sessions/"
  end
  match "/gebruikers/*path" do
    forward conn, path, "http://cache/gebruikers/"
  end
  match "/accounts/*path" do
    forward conn, path, "http://cache/accounts/"
  end

  match "/document-statuses/*path" do
    forward conn, path, "http://cache/document-statuses/"
  end
  get "/files/:id/download" do
    forward conn, [], "http://file/files/" <> id <> "/download"
  end
  get "/files/*path" do
    forward conn, path, "http://resource/files/"
  end
  patch "/files/*path" do
    forward conn, path, "http://resource/files/"
  end
  post "/files/*path" do
    forward conn, path, "http://file/files/"
  end
  # TODO: find all usage of this endpoint and replace it with `POST /files`
  # This is kept to maintain compatibility with code that uses the "old" endpoint.
  post "/file-service/files/*path" do
    forward conn, path, "http://file/files/"
  end
  delete "/files/*path" do
    forward conn, path, "http://file/files/"
  end
  match "/file-addresses/*path" do
    forward conn, path, "http://resource/file-addresses/"
  end
  match "/file-address-cache-statuses/*path" do
    forward conn, path, "http://resource/file-address-cache-statuses/"
  end
  ###############################################################
  # dynamic-forms-domain.lisp
  ###############################################################
  match "/form-nodes/*path" do
    forward conn, path, "http://cache/form-nodes/"
  end
  match "/form-inputs/*path" do
    forward conn, path, "http://cache/form-inputs/"
  end
  match "/dynamic-subforms/*path" do
    forward conn, path, "http://cache/dynamic-subforms/"
  end

  match "/input-states/*path" do
    forward conn, path, "http://cache/input-states/"
  end

  #################################################################
  # slave leidinggevenden
  #################################################################
  match "/bestuursfuncties/*path" do
    forward conn, path, "http://cache/bestuursfuncties/"
  end

  match "/functionarissen/*path" do
    forward conn, path, "http://cache/functionarissen/"
  end

  match "/contact-punten/*path" do
    forward conn, path, "http://cache/contact-punten/"
  end

  match "/adressen/*path" do
    forward conn, path, "http://cache/adressen/"
  end

  match "/functionaris-status-codes/*path" do
    forward conn, path, "http://cache/functionaris-status-codes/"
  end

  #################################################################
  # Toezicht / supervision
  #################################################################

  match "/vendors/*path" do
    forward conn, path, "http://cache/vendors/"
  end

  get "/concept-schemes/*path" do
    forward conn, path, "http://cache/concept-schemes/"
  end

  get "/concepts/*path" do
    forward conn, path, "http://cache/concepts/"
  end

  #################################################################
  # RRN SERVICE: person-uri-for-social-security-number-service
  #################################################################
  match "/rrn/*path" do
    forward conn, path, "http://person-uri-for-social-security-number/"
  end

  #################################################################
  # Bedienarenbeheer
  #################################################################
  match "/agents-in-position/*path" do
    forward conn, path, "http://cache/agents-in-position/"
  end

  match "/posts/*path" do
    forward conn, path, "http://cache/posts/"
  end

  match "/roles/*path" do
    forward conn, path, "http://cache/roles/"
  end

  match "/organizations/*path" do
    forward conn, path, "http://cache/organizations/"
  end

  match "/sites/*path" do
    forward conn, path, "http://cache/sites/"
  end

  match "/organization-status-codes/*path" do
    forward conn, path, "http://cache/organization-status-codes/"
  end

  match "/site-types/*path" do
    forward conn, path, "http://cache/site-types/"
  end

  match "/*_" do
    send_resp( conn, 404, "Route not found.  See config/dispatcher.ex" )
  end
end
