import { Changeset } from "../types";

export default async function dispatch(changesets: Changeset[]) {
  const subjects = new Set<string>();
  for (const changeset of changesets) {
    changeset.inserts.forEach((insert) => insert.subject.value);
    changeset.deletes.forEach((del) => subjects.add(del.subject.value));
  }

  console.log(
    `Received changeset(s) touching the following subjects:\n${[
      ...subjects,
    ].join("\n")}`
  );
}
