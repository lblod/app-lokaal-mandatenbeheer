import pandas as pd
import sys
import os
import uuid
from rdflib import Graph, Literal, RDF, URIRef, Namespace

# Load the CSV file
input_csv = sys.argv[1]
mandaat = input_csv[input_csv.rfind('_') + 1: input_csv.rfind('.')]
df = pd.read_csv(input_csv)

# Create a new RDF graph
g = Graph()

# Load the existing RDF graph if it exists, otherwise create a new one
output_ttl = 'output_file.ttl'

output_ttl = input_csv[:input_csv.rfind('_')] + '.ttl'
g = Graph()

if os.path.exists(output_ttl):
    g.parse(output_ttl, format='turtle')


# Define a namespace
EXT = Namespace("http://mu.semte.ch/vocabularies/ext/")
MU = Namespace("http://mu.semte.ch/vocabularies/core/")

# Bind the namespace prefix to the graph
g.bind("ext", EXT)

# Convert the DataFrame to RDF triples and add to the graph
for _, row in df.iterrows():
    myUuid = uuid.uuid4()
    subject = URIRef(f"http://example.org/row/{myUuid}")
    g.add((subject, RDF.type, EXT.NbMembersObject))
    g.add((subject, MU.uuid, Literal(myUuid)))
    g.add((subject, EXT.mandaat, Literal(mandaat)))
    for col in df.columns:
      if pd.notna(row[col]):
        predicate = EXT[col]
        obj = Literal(int(row[col])) if str(row[col]).isnumeric() else Literal(row[col])
        g.add((subject, predicate, obj))

# Save the graph to a TTL file
g.serialize(destination=output_ttl, format='turtle')
