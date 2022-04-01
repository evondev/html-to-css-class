import * as vscode from "vscode";

function regexIndexOf(string: string, regex: any, startpos?: number) {
  var indexOf = string.substring(startpos || 0).search(regex);
  return indexOf >= 0 ? indexOf + (startpos || 0) : indexOf;
}

function splitAtFirstSpace(str: string, prefixer: string): string[] {
  if (!str) {
    return [];
  }
  const i = str.indexOf(prefixer);
  if (i > 0) {
    return [str.substring(0, i), str.substring(i)];
  } else {
    return [str];
  }
}

function mergeArray(arr: string[][]) {
  let obj: Record<string, any> = {};
  for (let i = 0; i < arr.length; i++) {
    const key = arr[i][0];
    const value = arr[i][1];
    if (!(key in obj)) {
      obj[key] = [value];
    } else {
      obj[key].push(value);
    }
  }
  return obj;
}

function convertToSass(content: string[]) {
  let filterClass = [];
  let otherClass = [];
  for (let index = 0; index < content.length; index++) {
    const element = content[index];
    let regexIndex = regexIndexOf(element, /[^.a-z\s+\{\}]+/);
    let prefixer = element.split("").splice(regexIndex, 2).join("");
    if (!prefixer.includes("-") && !prefixer.includes("_")) {
      prefixer = "";
    }

    let newStr = splitAtFirstSpace(element, prefixer);
    if (!newStr[0].includes("{")) {
      filterClass.push(newStr);
    } else if (newStr[0].includes("{")) {
      let next = content[index + 1]
        ? content[index + 1]
            .replace(".", "")
            .replace(/\s+/gm, "")
            .replace("{}", "")
        : "";
      let prev = newStr[0]
        ? newStr[0].replace(".", "").replace(/\s+/gm, "").replace("{}", "")
        : "";
      if (!next.includes(prev)) {
        otherClass.push(newStr);
      }
    }
  }
  let values: any = Object.entries(mergeArray(filterClass));
  let template = otherClass.join("\n").toString();
  for (let index = 0; index < values.length; index++) {
    const element = values[index];
    let a: string[] = element[1];
    if (template.trim().includes(element[0].trim())) {
      template = template.replace(`${element[0]}{ }`, "");
    }
    template += `\n${element[0]} {\n${a.map((el) => `  &${el}`).join("\n")}\n}`;
  }
  return template.trim();
}

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "generate-css-class.classCopy",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const { document, selection } = editor;
        let selectionText = document.getText(selection);
        const classPattern =
          /(?:class|className)=(?:["']\W+\s*(?:\w+)\()?["']([^'"]+)['"]/gm;
        const matchesClass = selectionText.match(classPattern);
        if (matchesClass) {
          const filterClass = matchesClass
            .map(
              (el) =>
                `${el
                  .replace(/"/g, "")
                  .replace("class=", "")
                  .replace("className=", "")}`
            )
            .join(" ")
            .split(" ")
            .map((el) => `.${el}{\n\n}`);
          let uniqueClass = [...new Set([...filterClass])];
          vscode.env.clipboard.writeText(uniqueClass.join("\n"));
          vscode.window.showInformationMessage(
            "Copied to clipboard successfully"
          );
        } else {
          let arrWord = selectionText
            .replace(/"/g, "")
            .split(" ")
            .map((item) => `.${item}{\n\n}`);
          let uniqueClass = [...new Set([...arrWord])];
          vscode.env.clipboard.writeText(uniqueClass.join("\n"));
          vscode.window.showInformationMessage(
            "Copied to clipboard successfully"
          );
        }
      }
    }
  );
  let sassDisposable = vscode.commands.registerCommand(
    "generate-css-class.sassClassCopy",
    () => {
      // code here
      const editor = vscode.window.activeTextEditor;

      if (editor) {
        const document = editor.document;
        const selection = editor.selection;
        let word = document.getText(selection);
        const classPattern =
          /(?:class|className)=(?:["']\W+\s*(?:\w+)\()?["']([^'"]+)['"]/gm;
        const className = word.match(classPattern);
        if (className) {
          let filterClassName = className.map(
            (el) =>
              `${el
                .replace(/"/g, "")
                .replace("class=", "")
                .replace("className=", "")}`
          );
          const arrClass = [...filterClassName].map((item) =>
            item.split(" ").length > 1 ? item.split(" ") : item
          );
          const allClass = arrClass.flat(Infinity) as any;
          let uniqueClass = [...new Set([...allClass])];
          const generateClassName = uniqueClass.map((item) => `.${item}{\n\n}`);
          vscode.env.clipboard.writeText(convertToSass(generateClassName));
          vscode.window.showInformationMessage(
            "Copied to clipboard successfully"
          );
        } else {
          let filterClass = word
            .split(" ")
            .map(
              (el) =>
                `${el
                  .replace(/"/g, "")
                  .replace("class=", "")
                  .replace("className=", "")}`
            );
          let uniqueClass = [...new Set([...filterClass])];
          const generateClassName = uniqueClass.map((item) => `.${item}{\n\n}`);
          vscode.env.clipboard.writeText(convertToSass(generateClassName));
          vscode.window.showInformationMessage(
            "Copied to clipboard successfully"
          );
        }
      }
    }
  );

  context.subscriptions.push(disposable, sassDisposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
