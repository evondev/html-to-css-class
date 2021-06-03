"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
function regexIndexOf(string, regex, startpos) {
    var indexOf = string.substring(startpos || 0).search(regex);
    return indexOf >= 0 ? indexOf + (startpos || 0) : indexOf;
}
function splitAtFirstSpace(str, prefixer) {
    if (!str) {
        return [];
    }
    const i = str.indexOf(prefixer);
    if (i > 0) {
        return [str.substring(0, i), str.substring(i)];
    }
    else {
        return [str];
    }
}
function mergeArray(arr) {
    let obj = {};
    for (let i = 0; i < arr.length; i++) {
        const key = arr[i][0];
        const value = arr[i][1];
        if (!(key in obj)) {
            obj[key] = [value];
        }
        else {
            obj[key].push(value);
        }
    }
    return obj;
}
function convertToSass(content) {
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
        }
        else {
            otherClass.push(newStr);
        }
    }
    let values = Object.entries(mergeArray(filterClass));
    let template = otherClass.join("\n").toString();
    for (let index = 0; index < values.length; index++) {
        const element = values[index];
        let a = element[1];
        if (template.trim().includes(element[0].trim())) {
            template = template.replace(`${element[0]}{ }`, "");
        }
        template += `\n${element[0]} {\n${a
            .map((el) => `  &${el}`)
            .join("\n")}\n}`;
    }
    return template.trim();
}
function flatDeep(arr, d = 1) {
    return d > 0
        ? arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? flatDeep(val, d - 1) : val), [])
        : arr.slice();
}
function activate(context) {
    let disposable = vscode.commands.registerCommand("generate-css-class.classCopy", () => {
        // code here
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            const selection = editor.selection;
            let word = document.getText(selection);
            const classPattern = /(?:class|className)=(?:["']\W+\s*(?:\w+)\()?["']([^'"]+)['"]/gm;
            const className = word.match(classPattern);
            if (className) {
                let newClassName = className
                    .map((el) => `${el
                    .replace(/"/g, "")
                    .replace("class=", "")
                    .replace("className=", "")}`)
                    .join(" ")
                    .split(" ")
                    .map((el) => `.${el}{\n\n}`);
                let setClass = new Set([...newClassName]);
                let flatClassName = [...setClass];
                vscode.env.clipboard.writeText(flatClassName.join("\n"));
            }
            else {
                let arrWord = word.split(" ").map((item) => `.${item}{\n\n}`);
                let setClass = new Set([...arrWord]);
                let flatClassName = [...setClass];
                vscode.env.clipboard.writeText(flatClassName.join("\n"));
            }
        }
    });
    let sassDisposable = vscode.commands.registerCommand("generate-css-class.sassClassCopy", () => {
        // code here
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            const selection = editor.selection;
            let word = document.getText(selection);
            const classPattern = /(?:class|className)=(?:["']\W+\s*(?:\w+)\()?["']([^'"]+)['"]/gm;
            const className = word.match(classPattern);
            if (className) {
                let newClassName = className.map((el) => `${el
                    .replace(/"/g, "")
                    .replace("class=", "")
                    .replace("className=", "")}`);
                let setClass = new Set([...newClassName]);
                let flatClassName = [...setClass];
                // let newArr = flatClassName.map((item) =>
                //   item.split(" ").length > 1 ? item.split(" ") : item
                // );
                // let newFlat = flatDeep(newArr, Infinity);
                // newFlat = newFlat.map(
                //   (item: any) =>
                //     `.${item
                //       .replace(/"/g, "")
                //       .replace("class=", "")
                //       .replace("className=", "")
                //       .join("\n")}{ }`
                // );
                // console.log("activate ~ newFlat", newFlat);
                // let x = convertToSass(newFlat);
                // vscode.env.clipboard.writeText(x);
            }
            else {
                let arrWord = word
                    .split(" ")
                    .map((el) => `.${el
                    .replace(/"/g, "")
                    .replace("class=", "")
                    .replace("className=", "")
                    .replace(/\s+/g, ".")}{ }`);
                let setClass = new Set([...arrWord]);
                let flatClassName = [...setClass];
                let x = convertToSass(flatClassName);
                vscode.env.clipboard.writeText(x);
            }
        }
    });
    context.subscriptions.push(disposable, sassDisposable);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map