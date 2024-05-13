import { Changeset } from "../types";
import { handleRegularTypes } from "./handle-regular-types";
import { handleMandatarisType } from "./handle-mandataris-type";

export default async function dispatch(changesets: Changeset[]) {
  const nonHistoryChangesets = filterOutHistoryChanges(changesets);

  handleRegularTypes(nonHistoryChangesets);
  handleMandatarisType(nonHistoryChangesets);
}

function filterOutHistoryChanges(changesets: Changeset[]) {
  const doesNotStartWithHistoryUri = (quad) =>
    !quad.graph.value.startsWith("http://mu.semte.ch/graphs/formHistory");

  return changesets.map((change) => {
    const { inserts, deletes } = change;

    return {
      inserts: inserts.filter(doesNotStartWithHistoryUri),
      deletes: deletes.filter(doesNotStartWithHistoryUri),
    };
  });
}
