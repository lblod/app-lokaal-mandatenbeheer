import { deleteUnwantedInstances } from "./deleteUnwantedInstances";
import { deleteUnwantedTypes } from "./deleteUnwantedTypes";
import { dropUnimportantGraphs } from "./dropUnimportantGraphs";
import { moveOutOfPublic } from "./moveTypesOutOfPublic";
import { writeImportantGraphs } from "./writeImportantGraphs";

async function transform() {
  console.log(
    "\n\nWARNING: this script will DELETE a lot of data. Ctrl-C to cancel in the next 10 seconds\n\n"
  );
  await new Promise((resolve) => setTimeout(resolve, 10000));

  console.log("transforming!");
  await dropUnimportantGraphs();
  await deleteUnwantedTypes();
  await moveOutOfPublic();
  await deleteUnwantedInstances();
  console.log("done transforming!");
}

let job = Promise.resolve();
if(process.env.WRITE_IMPORTANT_GRAPHS === "true"){
  job = writeImportantGraphs();
}else if(process.env.DELETE_UNWANTED_TYPES === "true"){
  job = deleteUnwantedTypes();
} else{
  job = transform();
}
job.catch((e) => console.log(e));