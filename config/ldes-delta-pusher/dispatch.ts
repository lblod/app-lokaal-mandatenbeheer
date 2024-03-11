import { Changeset } from "../types";
import { handleRegularTypes } from "./handle-regular-types";
import { handleMandatarisType } from "./handle-mandataris-type";

export default async function dispatch(changesets: Changeset[]) {
  handleRegularTypes(changesets);
  handleMandatarisType(changesets);
}
