import { Changeset } from "../types";
import { publishInterestingSubjects } from "./handle-types-util";
import { InterestingSubject } from "./publisher"

const interestingSubjects = async (): Promise<InterestingSubject[]> => {
  return [];
}

export const handleDecisionType = async (changesets: Changeset[]) => {
  await publishInterestingSubjects(changesets, interestingSubjects);
};