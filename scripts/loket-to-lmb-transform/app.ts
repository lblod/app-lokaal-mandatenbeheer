import { deleteUnwantedTypes } from "./deleteUnwantedTypes";
import { dropUnimportantGraphs } from "./dropUnimportantGraphs";
import { moveOutOfPublic } from "./moveTypesOutOfPublic";

async function transform() {
  console.log(
    "\n\nWARNING: this script will DELETE a lot of data. Ctrl-C to cancel in the next 10 seconds\n\n"
  );
  await new Promise((resolve) => setTimeout(resolve, 10000));

  console.log("transforming!");
  await dropUnimportantGraphs();
  await deleteUnwantedTypes();
  await moveOutOfPublic();
  console.log("done transforming!");
}

transform().catch((e) => console.log(e));
