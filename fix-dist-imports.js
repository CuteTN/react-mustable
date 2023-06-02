import fs from "fs"

/**
 * @param {string} line 
 * @returns {boolean}
 */
function isImportExportLocalLine(line) {
  return (line.startsWith("import") || line.startsWith("export")) && line.includes("from \".");
}

/**
 * @param {string} line 
 * @returns {string}
 */
function fixImportExportLocalLines(line = "") {
  if (!isImportExportLocalLine(line))
    return line;

  let result = line;
  while (result.endsWith(";") || result.endsWith("\"")) result = result.substring(0, result.length - 1);
  result += ".js\";"

  return result;
}

function fixDistImportsFile(filePath) {
  if (!filePath.endsWith(".js"))
    return;

  const lines = (fs.readFileSync(filePath) ?? "").toString().split("\n");
  const fixedLines = lines.map(fixImportExportLocalLines);

  fs.writeFileSync(filePath, fixedLines.join("\n"))
}

function fixDistImportsDir(dirPath) {
  const dirItems = fs.readdirSync(dirPath);

  dirItems.forEach(subPath => {
    const fullSubPath = `${dirPath}/${subPath}`;
    if (fs.lstatSync(fullSubPath).isDirectory())
      fixDistImportsDir(fullSubPath);
    else {
      fixDistImportsFile(fullSubPath);
    }
  })
}

fixDistImportsDir("./dist");