Script to transform the Loket database to a LMB database.
Since Loket tracked way more data than only the Mandataris instances, this means removing a lot of data. As a result this will DESTROY the data in the targeted database. This script is made to be run on a dump of a loket database that can then be transformed into a toLoad folder for starting a new LMB instance.

The script is run by starting a docker compose that connects directly to the virtuoso database (not SEAS) which it expects to be present on the debug network. Note that this is not standard as a means of protecting you against touching the database directly. You will have to add the virtuoso instance to the debug network manually before running this.

It's recommended to run a checkpoint in your db before running this script and after, right before creating the dump file.

You can run this script by running `docker compose -f docker-compose.transform.yml up` in this folder.

## Known issues

### Drop graph batch size

There are a lot of graphs that are not interesting to us in the existing database. However, virtuoso complains if we drop 1000 graphs at a time, so we batch it in batches of 100.

### Refusal to drop a graph

Even in batches of 100, there has been instances where the database stubbornly refused to drop a graph (the query to check for unimportant graphs returned 1 instance but when inspecting that graph using a similar query, it was empty ??). In that case either ignore the graph (it will not be part of the dump as it has no triples) or restart the process
