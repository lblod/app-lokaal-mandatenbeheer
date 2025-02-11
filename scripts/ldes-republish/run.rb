#!/usr/bin/env ruby

require 'rdf/vocab'
require 'rdf/turtle'
require 'rdf/reasoner'
require 'net/http'
require 'json'


$stdout.sync = true
ENV['LOG_SPARQL_ALL']='false'
ENV['MU_SPARQL_ENDPOINT']='http://virtuoso:8890/sparql'
ENV['MU_SPARQL_TIMEOUT']='180'
require 'mu/auth-sudo'

def load_fake_deltas()
  puts('Loading fake deltas')
  inserts = []
  RDF::Reader.open("./data.ttl") do |reader|
    reader.each_statement do |statement|
      inserts.push({
        subject: {
          value: statement.subject.to_str,
          type: "uri"
        },
        predicate: {
          value: statement.predicate.to_str,
          type: "uri"
        },
        object: {
          value: statement.object.to_str,
          type: statement.object.literal? ? "literal" : "uri"
        },
        graph: {
          value: "http://mu.semte.ch/graphs/public",
          type: "uri"
        }
      })
    end
  end
  puts("Found #{inserts.length} triples")
  inserts
end

def post_fake_deltas(inserts)
  puts("Posting fake deltas")
  deltas = [{
    inserts: inserts,
    deletes: [],
  }]

  uri = URI.parse("http://ldes-delta-pusher/publish")
  header = {'Content-Type': 'application/json'}

  http = Net::HTTP.new(uri.host, uri.port)
  request = Net::HTTP::Post.new(uri.request_uri, header)
  request.body = deltas.to_json
  response = http.request(request)

  if(Integer(response.code) >= 300)
    puts("Error posting delta, response code: #{response.code}")
  else
    puts("Delta posted successfully")
  end
end


puts("Starting LDES update")
inserts = load_fake_deltas()
post_fake_deltas(inserts)
