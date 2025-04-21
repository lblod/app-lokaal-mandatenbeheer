import { sparqlEscapeUri, sparqlEscapeString, sparqlEscapeDateTime } from "mu";
import { updateSudo } from "@lblod/mu-auth-sudo";
import { v4 as uuidv4 } from "uuid";
import cron from 'node-cron';

// 30 minutes cron
cron.schedule('*/30 * * * *', async () => {
  console.log('\nFlag statuses that are expected to be crashed.');
  const momentWhenStatusesAreCrashed = new Date(new Date().getTime() - 1000 * 60 * 30);
  const queryString = `
    PREFIX dct: <http://purl.org/dc/terms/>
    PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>

    INSERT {
      GRAPH ?g {
        ?status ext:flaggedAsCrashed ${sparqlEscapeDateTime(new Date())} .
      }
    }
    WHERE {
      GRAPH ?g {
        ?status a ext:ReportStatus .
        ?status dct:created ?startedAt .

        FILTER ( ?startedAt < ${sparqlEscapeDateTime(momentWhenStatusesAreCrashed)})

        FILTER NOT EXISTS {
          ?status ext:flaggedAsCrashed ?isFlagged .
        }

        FILTER NOT EXISTS {
          ?status dct:issued ?finishedAt .
          ?status ext:forReport ?report .
        }
      }
      ?g ext:ownedBy ?bestuurseenheid .
    }
  `;

  try {
    await updateSudo(queryString);
    console.log('Done flagging report-statuses that where expected to be crashed.');
  } catch (e) {
    console.log('\nSomething unexpected went wrong while cleaning up the report-statuses.', e);
  }
});

export async function insertReportStatusInGraphs(uriAndUuid, namedGraphs) {
  const uuid = uuidv4();
  const uri = `http://data.lblod.info/id/report-statuses/${uuid}`;
  const queryString = `
    PREFIX dct: <http://purl.org/dc/terms/>
    PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
    PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>

    INSERT {
      GRAPH ?g {
        ${sparqlEscapeUri(uri)} a ext:ReportStatus .
        ${sparqlEscapeUri(uri)} mu:uuid ${sparqlEscapeString(uuid)} .
        ${sparqlEscapeUri(uri)} dct:created ${sparqlEscapeDateTime(new Date())} .
      }
    }
    WHERE {
      VALUES ?g {
        ${namedGraphs.map((g) => sparqlEscapeUri(g)).join("\n")}
      }
      ?g ext:ownedBy ?ocmwOrMunicipality .
    }
    `;
  try {
    await updateSudo(queryString);
    return uri;
  } catch (error) {
    console.error(`Could not create a report status for bestuurseenheid: ${uriAndUuid.uri}`)
  }
}

export async function updateReportStatusWithReport(statusUri, reportUri, namedGraphs) {
  const queryString = `
    PREFIX dct: <http://purl.org/dc/terms/>
    PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>

    DELETE {
      GRAPH ?g {
        ${sparqlEscapeUri(statusUri)} ext:flaggedAsCrashed ?isCrashedAt .
      }
    }
    INSERT {
      GRAPH ?g {
        ${sparqlEscapeUri(statusUri)} dct:issued ${sparqlEscapeDateTime(new Date())} .
        ${sparqlEscapeUri(statusUri)} ext:forReport ${sparqlEscapeUri(reportUri)} .
      }
    }
    WHERE {
      VALUES ?g {
        ${namedGraphs.map((g) => sparqlEscapeUri(g)).join("\n")}
      }
      ${sparqlEscapeUri(statusUri)} a ext:ReportStatus .

      OPTIONAL {
        ${sparqlEscapeUri(statusUri)} ext:flaggedAsCrashed ?isCrashedAt .
      }
    }
    `;
  try {
    await updateSudo(queryString);
  } catch (error) {
    console.error(`Could not update report statuses with uri: ${statusUri}`);
  }
}