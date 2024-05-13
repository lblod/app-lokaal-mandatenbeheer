import { CatchupPageItem } from "../types";
import { toMandatarisDraftState } from "./handle-mandataris-type";
import { getLdesForRegularType } from "./handle-regular-types";
import { InterestingSubject, publish } from "./publisher";
import { MANDATARIS_DRAFT_STATE } from "./utils/well-known-uris";

export const handlePage = async (items: CatchupPageItem[]) => {
  const interestingSubjects = [] as InterestingSubject[];
  const mandatarisSubjects = [] as string[];
  items.forEach((item) => {
    // don't care about predicates and objects
    if (item.type === "http://data.vlaanderen.be/ns/mandaat#Mandataris") {
      mandatarisSubjects.push(item.uri);
    } else {
      const ldesType = getLdesForRegularType(item.type);
      if (ldesType) {
        interestingSubjects.push({
          uri: item.uri,
          ldesType,
          type: item.type,
        });
      }
    }
  });

  const mandatarisSubjectsWithDraftState = await toMandatarisDraftState(
    mandatarisSubjects
  );
  mandatarisSubjectsWithDraftState.map((binding) => {
    const isDraftMandataris =
      binding.publicationStatus?.value === MANDATARIS_DRAFT_STATE;
    interestingSubjects.push({
      uri: binding.s.value,
      ldesType: isDraftMandataris ? "abb" : "public",
      type: "http://data.vlaanderen.be/ns/mandaat#Mandataris",
    });
  });
  // do this serially to avoid overloading the stream endpoint
  let current: InterestingSubject | undefined;
  while ((current = interestingSubjects.pop())) {
    await publish(current);
  }
};
