import { Changeset } from "../types";
import { handleRegularTypes } from "./handle-regular-types";
import { handleMandatarisType } from "./handle-mandataris-type";
import { handleDecisionType } from "./handle-decision-type";
import { handleMembershipType } from "./handle-membership-type";

export default async function dispatch(changesets: Changeset[]) {
  const nonHistoryChangesets = filterOutNonAppChanges(changesets);

  handleRegularTypes(nonHistoryChangesets);
  handleMandatarisType(nonHistoryChangesets);
  handleDecisionType(nonHistoryChangesets);
  handleMembershipType(nonHistoryChangesets);
}

function filterOutNonAppChanges(changesets: Changeset[]) {
  const doesNotStartWithHistoryUri = (quad) =>
    !quad.graph.value.startsWith("http://mu.semte.ch/graphs/formHistory") &&
    !quad.graph.value.startsWith(
      "http://mu.semte.ch/graphs/besluiten-consumed"
    );

  return changesets.map((change) => {
    const { inserts, deletes } = change;

    return {
      inserts: inserts.filter(doesNotStartWithHistoryUri),
      deletes: deletes.filter(doesNotStartWithHistoryUri),
    };
  });
}
