import { copyFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const resumeDirectory = join(process.cwd(), "public", "resume");
const stableResumePath = join(resumeDirectory, "resume.pdf");
const pdfFiles = (await readdir(resumeDirectory)).filter(
  (file) => file.toLowerCase().endsWith(".pdf") && file !== "resume.pdf",
);

if (pdfFiles.length !== 1) {
  throw new Error(
    `Expected exactly one source PDF in ${resumeDirectory}, found ${pdfFiles.length}.`,
  );
}

await copyFile(join(resumeDirectory, pdfFiles[0]), stableResumePath);
console.log(`Resume synced: ${pdfFiles[0]} -> resume.pdf`);
