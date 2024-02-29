import { Changeset } from "../types";
import { handleRegularTypes } from "./handle-regular-types";

export default async function dispatch(changesets: Changeset[]) {
  handleRegularTypes(changesets);
}
