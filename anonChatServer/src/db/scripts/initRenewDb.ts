import fs from "fs";
import readline from "readline";
import { docStatPath } from "../methods/anonDbCore.ts";

const initialStatsDoc = {
  activeRooms: 0,
  shadowsOnline: 0,
  totalUsers: 0,
  secretsShared: 0,
}; // Replace with your actual initial data

// This function needs to be aware of the user's decision
async function initDBRenewed_VOLATILE(
  consoleWarningFn: () => Promise<boolean>
) {
  // Assuming createDocIfNotExistINIT is defined elsewhere
  // createDocIfNotExistINIT(docStatPath);

  const res = await consoleWarningFn();
  if (!res) {
    console.log("Database reset aborted. Exiting.");
    return; // Exit the function if the user said no
  }

  // This part of the code only executes if the user confirms
  fs.writeFileSync(
    docStatPath,
    JSON.stringify(initialStatsDoc, null, 2),
    "utf-8"
  );
  console.log("Database has been reset successfully.");
}

// Promisified version of consoleWarning
async function consoleWarning(): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise<boolean>((resolve) => {
    rl.question(
      "THIS ACTION WILL RESET THE ENTIRE DATABASE. DO YOU WANT TO CONTINUE? Y/N ",
      (answer) => {
        rl.close();
        if (answer.trim().toLowerCase() === "y") {
          resolve(true); // Resolve the promise with true for 'yes'
        } else {
          resolve(false); // Resolve the promise with false for 'no'
        }
      }
    );
  });
}

// Start the process
initDBRenewed_VOLATILE(consoleWarning);
