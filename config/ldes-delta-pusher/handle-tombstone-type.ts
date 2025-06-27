import { Changeset } from "../types";
import { sparqlEscapeUri } from "mu";

import { publishInterestingSubjects } from "./handle-types-util";
import { InterestingSubject, LDES_TYPE } from "./publisher";
import { ldesInstances } from './ldes-instances';


const typeValuesForStream = {
  public: Object.keys(ldesInstances["public"].entities).map(uri => sparqlEscapeUri(uri)).join(' \n'),
  abb: Object.keys(ldesInstances["abb"].entities).map(uri => sparqlEscapeUri(uri)).join(' \n'),
  internal: Object.keys(ldesInstances["internal"].entities).map(uri => sparqlEscapeUri(uri)).join(' \n'),
};

const interestingSubjects = async (
  subjects: string[]
): Promise<InterestingSubject[]> => {
  const filter = (stream: LDES_TYPE ) => {
    return `
      GRAPH ?g {
        VALUES ?formerType { ${typeValuesForStream[stream]} }
        ?s <http://www.w3.org/ns/activitystreams#formerType> ?formerType . 
      }
    `;
  }

  return subjects
    .map((subject) => {
      return {
        uri: subject,
        ldesType: {
          public: {
            filter: filter('public')
          }, abb: {
            filter: filter('abb')
          }, internal: {
            filter: filter('internal')
          }
        },
        type: "http://www.w3.org/ns/activitystreams#Tombstone",
      };
    })
};


export const handleTombstoneType = async (changesets: Changeset[]) => {
  await publishInterestingSubjects(changesets, interestingSubjects);
};