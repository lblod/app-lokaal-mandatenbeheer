import { Changeset, Quad } from '../types';
import { handleRegularTypes } from './handle-regular-types';
import { handleMandatarisType } from './handle-mandataris-type';
import { handleDecisionType } from './handle-decision-type';
import { handleMembershipType } from './handle-membership-type';
import { handleTombstoneType } from './handle-tombstone-type';

export default async function dispatch(changesets: Changeset[]) {
  const nonHistoryChangesets = filterOutNonAppChanges(changesets);

  handleRegularTypes(nonHistoryChangesets);
  handleMandatarisType(nonHistoryChangesets);
  handleDecisionType(nonHistoryChangesets);
  handleMembershipType(nonHistoryChangesets);
  handleTombstoneType(nonHistoryChangesets);
}

function filterOutNonAppChanges(changesets: Changeset[]) {
  const graphsToIgnore = [
    'http://mu.semte.ch/graphs/landing-zone/op-public',
    'http://mu.semte.ch/graphs/formHistory',
    'http://mu.semte.ch/graphs/besluiten-consumed',
  ];
  const shouldNotIgnoreGraph = (quad: Quad) => {
    return !graphsToIgnore.find((graphPrefix) => {
      return quad.graph.value.startsWith(graphPrefix);
    });
  };

  return changesets.map((change) => {
    const { inserts, deletes } = change;

    return {
      inserts: inserts.filter(shouldNotIgnoreGraph),
      deletes: deletes.filter(shouldNotIgnoreGraph),
    };
  });
}
