/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.deactivate = exports.activate = void 0;
const vscode = __webpack_require__(1);
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
        else if (newStr[0].includes("{")) {
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
    let values = Object.entries(mergeArray(filterClass));
    let template = otherClass.join("\n").toString();
    for (let index = 0; index < values.length; index++) {
        const element = values[index];
        let a = element[1];
        if (template.trim().includes(element[0].trim())) {
            template = template.replace(`${element[0]}{ }`, "");
        }
        template += `\n${element[0]} {\n${a.map((el) => `  &${el}`).join("\n")}\n}`;
    }
    return template.trim();
}
function activate(context) {
    let disposable = vscode.commands.registerCommand("generate-css-class.classCopy", () => __awaiter(this, void 0, void 0, function* () {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const { document, selection } = editor;
            let selectionText = document.getText(selection);
            const classPattern = /(?:class|className)=(?:["']\W+\s*(?:\w+)\()?["']([^'"]+)['"]/gm;
            const matchesClass = selectionText.match(classPattern);
            if (matchesClass) {
                const filterClass = matchesClass
                    .map((el) => `${el
                    .replace(/"/g, "")
                    .replace("class=", "")
                    .replace("className=", "")}`)
                    .join(" ")
                    .split(" ")
                    .map((el) => `.${el}{\n\n}`);
                let uniqueClass = [...new Set([...filterClass])];
                vscode.env.clipboard.writeText(uniqueClass.join("\n"));
                vscode.window.showInformationMessage("Copied to clipboard successfully");
            }
            else {
                let arrWord = selectionText
                    .replace(/"/g, "")
                    .split(" ")
                    .map((item) => `.${item}{\n\n}`);
                let uniqueClass = [...new Set([...arrWord])];
                vscode.env.clipboard.writeText(uniqueClass.join("\n"));
                vscode.window.showInformationMessage("Copied to clipboard successfully");
            }
        }
    }));
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
                let filterClassName = className.map((el) => `${el
                    .replace(/"/g, "")
                    .replace("class=", "")
                    .replace("className=", "")}`);
                const arrClass = [...filterClassName].map((item) => item.split(" ").length > 1 ? item.split(" ") : item);
                const allClass = arrClass.flat(Infinity);
                let uniqueClass = [...new Set([...allClass])];
                const generateClassName = uniqueClass.map((item) => `.${item}{\n\n}`);
                vscode.env.clipboard.writeText(convertToSass(generateClassName));
                vscode.window.showInformationMessage("Copied to clipboard successfully");
            }
            else {
                let filterClass = word
                    .split(" ")
                    .map((el) => `${el
                    .replace(/"/g, "")
                    .replace("class=", "")
                    .replace("className=", "")}`);
                let uniqueClass = [...new Set([...filterClass])];
                const generateClassName = uniqueClass.map((item) => `.${item}{\n\n}`);
                vscode.env.clipboard.writeText(convertToSass(generateClassName));
                vscode.window.showInformationMessage("Copied to clipboard successfully");
            }
        }
    });
    context.subscriptions.push(disposable, sassDisposable);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;


/***/ }),
/* 1 */
/***/ ((module) => {

module.exports = require("vscode");;

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(0);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;
//# sourceMappingURL=extension.js.map