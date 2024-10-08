import { ldesInstances } from "./ldes-instances";

export type HealingConfig = Awaited<ReturnType<typeof getHealingConfig>>;
export const getHealingConfig = async () => {
  return ldesInstances;
};
