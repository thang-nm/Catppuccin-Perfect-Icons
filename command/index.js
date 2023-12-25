const fs = require("fs");
const path = require("path");
const os = require("os");

const extensionId = "thang-nm.catppuccin-perfect-icons";
const command = process.argv[2];

switch (command) {
  case "hide_arrow":
    setArrowHidden(true);
    break;
  case "show_arrow":
    setArrowHidden(false);
    break;
  case "hide_folder":
    setFolderHidden(true);
    break;
  case "show_folder":
    setFolderHidden(false);
    break;
  default:
    console.error("No command to run!");
    process.exit(0);
}

console.log("🌈 Done!");

function setArrowHidden(hidden) {
  mutate((json) => {
    json.hidesExplorerArrows = hidden;
    return json;
  });
}

function setFolderHidden(hidden) {
  mutate((json) => {
    if (hidden && Object.keys(json.folderNames || {}).length) {
      json.hidesExplorerArrows = false;
      json.folder_2 = json.folder;
      json.folderExpanded_2 = json.folderExpanded;
      json.folderNames_2 = json.folderNames;
      json.folderNamesExpanded_2 = json.folderNamesExpanded;
      json.folderNames = {};
      json.folderNamesExpanded = {};
      delete json.folder;
      delete json.folderExpanded;
      return json;
    }
    if (!hidden && Object.keys(json.folderNames_2 || {}).length) {
      json.hidesExplorerArrows = false;
      json.folder = json.folder_2;
      json.folderExpanded = json.folderExpanded_2;
      json.folderNames = json.folderNames_2;
      json.folderNamesExpanded = json.folderNamesExpanded_2;
      delete json.folder_2;
      delete json.folderExpanded_2;
      delete json.folderNames_2;
      delete json.folderNamesExpanded_2;
      return json;
    }
    return null;
  });
}

function mutate(callback) {
  const themesDir = path.join(extensionFolder(), "themes");
  const themes = fs.readdirSync(themesDir);
  for (let theme of themes) {
    if (!fs.lstatSync(path.join(themesDir, theme)).isDirectory()) {
      continue;
    }
    const jsonPath = path.join(themesDir, theme, "theme.json");
    const jsonString = fs.readFileSync(jsonPath);
    const json = callback(JSON.parse(jsonString));
    if (json) {
      fs.writeFileSync(jsonPath, JSON.stringify(json));
    }
  }
}

function extensionFolder() {
  const extensionsPath = path.join(os.homedir(), ".vscode", "extensions");
  const extensionsString = fs.readFileSync(
    path.join(extensionsPath, "extensions.json")
  );
  const json = JSON.parse(extensionsString);
  const extension = json.find((ext) => ext.identifier.id === extensionId);
  return path.join(extensionsPath, extension.relativeLocation);
}
