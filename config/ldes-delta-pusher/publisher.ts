import { sparqlEscapeUri, sparqlEscape } from "mu";
import { querySudo } from "@lblod/mu-auth-sudo";
import { addData, getConfigFromEnv } from "@lblod/ldes-producer";
import { LDES_FRAGMENTER } from "../config";
import { log } from "./logger";
import {
  defaultProperties,
  ldesInstances,
  officialPredicates,
} from "./ldes-instances";
import dispatch from "./dispatch";

const ldesProducerConfig = getConfigFromEnv();

export type LDES_TYPE = "public" | "abb" | "internal";
export type TypesWithFilter = {
  [key in LDES_TYPE]: {
    filter?: string;
  };
};
export type InterestingSubject = {
  uri: string;
  type: string;
  ldesType: LDES_TYPE | TypesWithFilter;
  filter?: string;
};

const fetchSubjectData = async (
  subject: InterestingSubject,
  target: string
) => {
  let predicateLimiter = "";
  if (["abb", "public"].includes(target) && officialPredicates[subject.type]) {
    let properties = officialPredicates[subject.type];
    properties = properties.concat(defaultProperties);
    predicateLimiter = `
    VALUES ?p {
      ${properties.map((p) => sparqlEscapeUri(p)).join("\n")}
    }`;
  }
  const filter =
    typeof subject.ldesType === "object" && subject.ldesType[target].filter
      ? subject.ldesType[target].filter
      : "";
  const transformPredicates =
    ldesInstances[target].entities[subject.type].transformPredicates;
  const transformTypes =
    ldesInstances[target].entities[subject.type].transformTypes;

  let extraConstruct = "";
  let extraWhere = "";
  if (transformPredicates) {
    let mapping = "";
    Object.keys(transformPredicates).forEach((from) => {
      const to = transformPredicates[from];
      mapping += `(${sparqlEscapeUri(from)} ${sparqlEscapeUri(to)})\n`;
    });
    extraWhere = `VALUES (?pFrom ?pTo) {
      ${mapping}
    }
    BIND(IF(?p = ?pFrom, ?pTo, ?p) AS ?pNew)`;
    extraConstruct = `<${subject.uri}> ?pNew ?o.`;
  }
  if (transformTypes) {
    const extraTypes = transformTypes
      .map((type) => `${sparqlEscapeUri(type)}`)
      .join(", ");
    extraConstruct = `<${subject.uri}> a ${extraTypes}.`;
  }

  // we are also publishing the bestuurseenheid with our data so consuming apps easily know where to put the concept
  const data = await querySudo(`
    PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
    CONSTRUCT {
      <${subject.uri}> ?p ?o .
      <${subject.uri}> ext:relatedTo ?bestuurseenheid .
      ${extraConstruct}
    } WHERE {
      GRAPH ?g {
        <${subject.uri}> ?p ?o .
      }
      ?g ext:ownedBy ?bestuurseenheid .
      ${predicateLimiter}
      ${filter}
      ${extraWhere}
    }
  `);
  return data.results.bindings.map(bindingToTriple).join("\n");
};

const datatypeNames = {
  "http://www.w3.org/2001/XMLSchema#dateTime": "dateTime",
  "http://www.w3.org/2001/XMLSchema#date": "date",
  "http://www.w3.org/2001/XMLSchema#decimal": "decimal",
  "http://www.w3.org/2001/XMLSchema#integer": "int",
  "http://www.w3.org/2001/XMLSchema#float": "float",
  "http://www.w3.org/2001/XMLSchema#boolean": "bool",
};

const sparqlEscapeObject = (bindingObject): string => {
  const escapeType = datatypeNames[bindingObject.datatype] || "string";
  if (bindingObject.datatype === "http://www.w3.org/2001/XMLSchema#dateTime") {
    // sparqlEscape formats it slightly differently and then the comparison breaks in healing
    const safeValue = `${bindingObject.value}`;
    return `"${safeValue.split('"').join("")}"^^xsd:dateTime`;
  }
  return bindingObject.type === "uri"
    ? sparqlEscapeUri(bindingObject.value)
    : sparqlEscape(bindingObject.value, escapeType);
};

export const bindingToTriple = (binding) =>
  `${sparqlEscapeUri(binding.s.value)} ${sparqlEscapeUri(
    binding.p.value
  )} ${sparqlEscapeObject(binding.o)} .`;

const streamTargets: Record<LDES_TYPE, string[]> = {
  public: ["public", "abb", "internal"],
  abb: ["abb", "internal"],
  internal: ["internal"],
};

/**
 * Publish the currently known info for the given subject URI to the LDES endpoint of the given type
 * @param ldesType the type of the LDES endpoint to publish to (e.g. "public" or "abb")
 * @param subject the uri of the subject to fetch data for and publish
 */
export const publish = async (
  subject: InterestingSubject,
  additionalTriples?: string
) => {
  let targets;
  if (typeof subject.ldesType === "string") {
    targets = streamTargets[subject.ldesType];
  } else {
    targets = Object.keys(subject.ldesType);
  }
  const toRepublish: any[] = [];
  await Promise.all(
    targets.map(async (target) => {
      if (ldesInstances[target].entities[subject.type]?.republishRelated) {
        toRepublish.push(
          ...(await fetchRelatedToRepublish(
            subject,
            ldesInstances[target].entities[subject.type].republishRelated
          ))
        );
      }

      let data = await fetchSubjectData(subject, target);
      if (additionalTriples) {
        data = `${data}\n${additionalTriples}`;
      }

      log(
        `[${target}] Publishing data for subject ${subject.uri}:\n${data}`,
        "debug"
      );
      const safeData = `@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .\n${data}`;

      await addData(ldesProducerConfig, {
        contentType: "text/turtle",
        folder: target,
        body: safeData,
        fragmenter: LDES_FRAGMENTER,
      });
    })
  );
  await republishRelated(toRepublish);
};

async function fetchRelatedToRepublish(
  subject: InterestingSubject,
  predicates: string[]
) {
  const relatedSubjects = await querySudo(`
    PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
    SELECT DISTINCT ?related ?type ?g WHERE {
      GRAPH ?g {
        <${subject.uri}> ?p ?related .
        ?related a ?type .
      }
      ?g ext:ownedBy ?bestuurseenheid .
      VALUES ?p { ${predicates.map((p) => sparqlEscapeUri(p)).join(" ")} }
    }
  `);
  const fakeDeltas = relatedSubjects.results.bindings.map((subject) => ({
    subject: { value: subject.related.value },
    predicate: { value: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" },
    object: { value: subject.type.value },
    graph: { value: subject.g.value },
  }));
  return fakeDeltas;
}

async function republishRelated(toRepublish) {
  if (toRepublish.length === 0) {
    return;
  }
  const uniqueSubjects = {};
  toRepublish.forEach((delta) => {
    uniqueSubjects[delta.subject.value + delta.object.value] = delta;
  });
  const fakeCompleteDelta = {
    inserts: Object.values(uniqueSubjects),
    deletes: [],
  };
  await dispatch([fakeCompleteDelta]);
}
