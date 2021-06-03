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
        .replace(".", "")
        .replace(/\s+/gm, "")
        .replace("{}", "");
      let prev = newStr[0]
        .replace(".", "")
        .replace(/\s+/gm, "")
        .replace("{}", "");
      if (!next.includes(prev) && (next.includes("-") || next.includes("_"))) {
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

function flatDeep(arr: any, d = 1) {
  return d > 0
    ? arr.reduce(
        (acc: any, val: any) =>
          acc.concat(Array.isArray(val) ? flatDeep(val, d - 1) : val),
        []
      )
    : arr.slice();
}

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "generate-css-class.classCopy",
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
          let newClassName = className
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
          let setClass = new Set([...newClassName]);
          let flatClassName = [...setClass];
          let newArr = flatClassName.map((item) =>
            item.split(" ").length > 1 ? item.split(" ") : item
          );
          let newClassName2 = className
            .map(
              (el) =>
                `.${el
                  .replace(/"/g, "")
                  .replace("class=", "")
                  .replace("className=", "")}`
            )
            .filter((item) => item.split(" ").length > 1)
            .map((item) => `${item.replace(/\s+/gm, ".")}{\n\n}`);
          let newArr3 = [...newArr, ...newClassName2];
          let newFlat = flatDeep(newArr3, 10);
          let setClassFlat = new Set([...newFlat]);
          let flatClassName2 = [...setClassFlat];
          let x = [...flatClassName2].map((item) => `${item}`);
          vscode.env.clipboard.writeText(x.join("\n"));
        } else {
          let arrWord = word.split(" ").map((item) => `.${item}{\n\n}`);
          let setClass = new Set([...arrWord]);
          let flatClassName = [...setClass];
          let newArr = flatClassName.map((item) =>
            item.split(" ").length > 1 ? item.split(" ") : item
          );
          let newClassName2 =
            word
              .split(" ")
              .map((item) => `.${item.replace(/\s+/gm, ".")}`)
              .join("") + "{\n}";
          let newArr3 = [...newArr, newClassName2];
          let newFlat = flatDeep(newArr3, 10);
          let setClassFlat = new Set([...newFlat]);
          let flatClassName2 = [...setClassFlat];
          let x = [...flatClassName2].map((item) => `${item}`);
          vscode.env.clipboard.writeText(x.join("\n"));
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
          let newClassName = className.map(
            (el) =>
              `${el
                .replace(/"/g, "")
                .replace("class=", "")
                .replace("className=", "")}`
          );
          let setClass = new Set([...newClassName]);
          let flatClassName = [...setClass];
          let newArr = flatClassName.map((item) =>
            item.split(" ").length > 1 ? item.split(" ") : item
          );
          let newArr2 = flatClassName
            .filter((item) => item.split(" ").length > 1)
            .map((item) => `${item.replace(/\s+/gm, ".")}`);
          let newArr3 = [...newArr, ...newArr2];
          let newFlat = flatDeep(newArr3, 10);
          let setClassFlat = new Set([...newFlat]);
          let flatClassName2 = [...setClassFlat];
          let x = [...flatClassName2].map((item) => `.${item}{\n\n}`);
          let y = convertToSass(x);
          vscode.env.clipboard.writeText(y);
        } else {
          let arrWord = word
            .split(" ")
            .map(
              (el) =>
                `${el
                  .replace(/"/g, "")
                  .replace("class=", "")
                  .replace("className=", "")}`
            );
          let setClass = new Set([...arrWord]);
          let flatClassName = [...setClass];
          let newArr = flatClassName.map((item) =>
            item.split(" ").length > 1 ? item.split(" ") : item
          );
          let newArr2 = word
            .split(" ")
            .map((item) => `${item.replace(/\s+/gm, ".")}`)
            .join(".");

          let newArr3 = [...newArr, newArr2];
          let newFlat = flatDeep(newArr3, 10);
          let setClassFlat = new Set([...newFlat]);
          let flatClassName2 = [...setClassFlat];
          let x = [...flatClassName2].map((item) => `.${item}{ }`);
          let y = convertToSass(x);
          vscode.env.clipboard.writeText(y);
        }
      }
    }
  );

  context.subscriptions.push(disposable, sassDisposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
