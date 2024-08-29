import { Changeset } from "../types";
import { InterestingSubject, publish } from "./publisher";
import { log } from "./logger";

type SubjectFilter = (subjects: string[]) => Promise<InterestingSubject[]>;

const mapToSubjects = (changesets: Changeset[]) => {
  const subjects = new Set<string>();
  for (const changeset of changesets) {
    changeset.inserts.forEach((insert) => {
      subjects.add(insert.subject.value);
    });
    changeset.deletes.forEach((del) => {
      subjects.add(del.subject.value);
    });
  }
  return Array.from(subjects);
};

const filterInterestingSubjects = async (
  allSubjects: string[],
  filter: SubjectFilter
) => {
  let subjectsToKeep: InterestingSubject[] = [];

  const chunkSize = 1000;
  for (let i = 0; i < allSubjects.length; i += chunkSize) {
    const currentChunk = allSubjects.slice(i, i + chunkSize);
    const toKeepForChunk = await filter(currentChunk);
    subjectsToKeep = subjectsToKeep.concat(toKeepForChunk);
  }

  return subjectsToKeep;
};

export const publishInterestingSubjects = async (
  changesets: Changeset[],
  filter: SubjectFilter
) => {
  const allSubjects = mapToSubjects(changesets);
  const interestingSubjects = await filterInterestingSubjects(
    allSubjects,
    filter
  );
  log(
    `Received changeset(s) touching the following interesting subjects:\n${JSON.stringify(
      interestingSubjects
    )}`,
    "debug"
  );

  // do this serially to avoid overloading the stream endpoint
  let current: InterestingSubject | undefined;
  while ((current = interestingSubjects.pop())) {
    await publish(current);
  }
};
