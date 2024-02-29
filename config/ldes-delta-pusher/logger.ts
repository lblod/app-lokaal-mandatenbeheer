const DEBUG = process.env.DEBUG === "true";

export const log = (message: string, level = "log") => {
  if (level === "log") {
    console.log(message);
  } else if (level === "error") {
    console.error(message);
  } else if (level === "debug" && DEBUG) {
    console.log(`DEBUG: ${message}`);
  }
};
