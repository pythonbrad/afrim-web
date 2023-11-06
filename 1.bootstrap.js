(window["webpackJsonp"] = window["webpackJsonp"] || []).push([[1],{

/***/ "./config.js":
/*!*******************!*\
  !*** ./config.js ***!
  \*******************/
/*! exports provided: loadConfig */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* WEBPACK VAR INJECTION */(function(global) {/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"loadConfig\", function() { return loadConfig; });\n/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils */ \"./utils.js\");\n\n\n// Load the afrim configuration through an URL.\nasync function loadConfig(path) {\n  var content = await Object(_utils__WEBPACK_IMPORTED_MODULE_0__[\"httpGet\"])(path).then((data) => Object(_utils__WEBPACK_IMPORTED_MODULE_0__[\"tomlToJson\"])(data));\n  var auto_capitalize = false;\n\n  if (content.core) {\n    auto_capitalize = content.core.auto_capitalize || false;\n  }\n\n  if (typeof content.translation == \"object\") {\n    var items = await Object.entries(content.translation);\n\n    for (let item of items) {\n      var key = item[0];\n      var value = item[1];\n\n      // We extract the translation.\n      if (typeof value == \"object\") {\n        if (value.path) {\n          await loadConfig(new URL(value.path, path).href);\n        } else if (value.alias) {\n          var _ = null;\n\n          if (value.values) {\n            _ = value.values;\n          } else {\n            _ = [value.value];\n          }\n\n          for (let e of value.alias) {\n            global.memory.dictionary[e] = _;\n          }\n          global.memory.dictionary[key] = _;\n        }\n      } else {\n        global.memory.dictionary[key] = [value];\n      }\n    }\n  }\n\n  // We extract the data.\n  if (typeof content.data == \"object\") {\n    var items = await Object.entries(content.data);\n\n    for (let item of items) {\n      var key = item[0];\n      var value = item[1];\n\n      if (typeof value == \"object\") {\n        if (value.path) {\n          await loadConfig(new URL(value.path, path).href);\n        } else if (value.alias) {\n          for (let e of value.alias) {\n            global.memory.data[e] = value.value;\n\n            if (auto_capitalize) {\n              global.memory.data[e[0].toUpperCase() + e.slice(1)] =\n                value.value.toUpperCase();\n            }\n          }\n          global.memory.data[key] = value.value;\n\n          if (auto_capitalize) {\n            global.memory.data[key[0].toUpperCase() + key.slice(1)] =\n              value.value.toUpperCase();\n          }\n        }\n      } else {\n        global.memory.data[key] = value;\n      }\n    }\n  }\n\n  // We extract the translators.\n  if (typeof content.translator == \"object\") {\n    var items = await Object.entries(content.translator);\n\n    for (let item of items) {\n      var key = item[0];\n      var value = item[1];\n      var content = await Object(_utils__WEBPACK_IMPORTED_MODULE_0__[\"httpGet\"])(new URL(value, path).href).then(\n        (data) => data,\n      );\n\n      global.memory.translators[key] = content;\n    }\n  }\n}\n\n/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./node_modules/webpack/buildin/global.js */ \"./node_modules/webpack/buildin/global.js\")))\n\n//# sourceURL=webpack:///./config.js?");

/***/ }),

/***/ "./index.js":
/*!******************!*\
  !*** ./index.js ***!
  \******************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* WEBPACK VAR INJECTION */(function(global) {/* harmony import */ var afrim_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! afrim-js */ \"./node_modules/afrim-js/afrim_js.js\");\n/* harmony import */ var _config__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./config */ \"./config.js\");\n\n\n\nglobal.memory = Object({\n  predicates: Array(),\n  predicateId: 0,\n  pageSize: 5,\n  data: Object(),\n  dictionary: Object(),\n  translators: Object(),\n});\n\n(async function () {\n  //\n  var textFieldElement = document.getElementById(\"textfield\");\n  var downloadStatusElement = document.getElementById(\"download-status\");\n  var tooltipElement = document.getElementById(\"tooltip\");\n  var tooltipInputElement = document.getElementById(\"tooltip-input\");\n  var tooltipPredicatesElement = document.getElementById(\"tooltip-predicates\");\n\n  //\n  var idle = false;\n  var cursorPos = 0;\n\n  // Clear the predicates.\n  var clearPredicate = () => {\n    tooltipPredicatesElement.innerHTML = \"\";\n    global.memory.predicateId = 0;\n    global.memory.predicates = Array();\n  };\n\n  // Load predicates in the memory\n  var loadPredicates = (predicates) => {\n    clearPredicate();\n    var predicateId = 0;\n\n    for (let predicate of predicates) {\n      for (let e of predicate[2]) {\n        global.memory.predicates.push([\n          ++predicateId,\n          predicate[0],\n          predicate[1],\n          e,\n          predicate[3],\n        ]);\n      }\n    }\n  };\n\n  // Update the predicates.\n  var updatePredicate = () => {\n    tooltipPredicatesElement.innerHTML = \"\";\n\n    var counter = 0;\n    var predicates = global.memory.predicates\n      .slice(global.memory.predicateId, global.memory.predicates.length)\n      .concat(global.memory.predicates.slice(0, global.memory.predicateId));\n\n    for (let predicate of predicates) {\n      // Mark the selected predicate.\n      var c = counter == 0 ? \"✏️\" : \"\";\n\n      if (counter++ > global.memory.pageSize) break;\n\n      // Config the tooltip predicate element.\n      var e = document.createElement(\"a\");\n      e.classList.add(\"dropdown-item\");\n      e.innerText = `${c} ${predicate[0]}. ${predicate[3]} ~${predicate[2]}`;\n      e.addEventListener(\n        \"click\",\n        () => {\n          preprocessor.commit(predicate[3]);\n          preprocessor.process(\"\", \"keydown\");\n          clearPredicate();\n        },\n        false,\n      );\n      tooltipPredicatesElement.append(e);\n    }\n  };\n\n  // We execute preprocessor commands in idle.\n  var processCommand = () => {\n    var cmd = preprocessor.pop_stack();\n    var textValue = textFieldElement.value;\n\n    cursorPos = cursorPos < 0 ? 0 : cursorPos;\n\n    if (cmd) {\n      if (cmd.startsWith(\"!\")) {\n        if (cmd == \"!backspace\") {\n          textFieldElement.value =\n            textValue.substring(0, cursorPos - 1) +\n            textValue.substring(cursorPos, textValue.length);\n          cursorPos--;\n        } else if (cmd == \"!pause\") {\n          idle = true;\n        } else if (cmd == \"!resume\") {\n          idle = false;\n        }\n      } else if (cmd == \".\") {\n      } else {\n        textFieldElement.value =\n          textValue.substring(0, cursorPos) +\n          cmd +\n          textValue.substring(cursorPos, textValue.length);\n      }\n    }\n\n    requestAnimationFrame(processCommand);\n  };\n\n  // We wait that the afrim ime engine is ready.\n  textFieldElement.disabled = true;\n  downloadStatusElement.hidden = false;\n\n  // We download the datalang.\n  var lang = sessionStorage.getItem(\"lang\") || \"geez\";\n  document.getElementById(lang).classList.toggle(\"is-active\");\n  await Object(_config__WEBPACK_IMPORTED_MODULE_1__[\"loadConfig\"])(\n    `https://raw.githubusercontent.com/pythonbrad/afrim-data/minimal/${lang}/${lang}.toml`,\n  );\n\n  //\n  textFieldElement.disabled = false;\n  downloadStatusElement.hidden = true;\n\n  // We config the afrim ime.\n  var preprocessor = afrim_js__WEBPACK_IMPORTED_MODULE_0__[\"Preprocessor\"].new(global.memory.data, 64);\n  var translator = afrim_js__WEBPACK_IMPORTED_MODULE_0__[\"Translator\"].new(global.memory.dictionary, false);\n  Object.entries(global.memory.translators).forEach((e) =>\n    translator.register(e[0], e[1]),\n  );\n\n  // We listen keyboard events.\n  textFieldElement.addEventListener(\n    \"keyup\",\n    (event) => {\n      cursorPos = textFieldElement.selectionEnd;\n\n      // We manage special keys.\n      if (event.ctrlKey) {\n        // Previous predicate.\n        if (event.code == \"ShiftLeft\") {\n          global.memory.predicateId =\n            global.memory.predicateId < 1\n              ? global.memory.predicates.length - 1\n              : global.memory.predicateId - 1;\n          updatePredicate();\n        }\n        // Next predicate.\n        else if (event.code == \"ShiftRight\") {\n          global.memory.predicateId =\n            global.memory.predicateId >= global.memory.predicates.length - 1\n              ? 0\n              : global.memory.predicateId + 1;\n          updatePredicate();\n        }\n        // Commit the predicate.\n        else if (event.code == \"Space\") {\n          var predicate = global.memory.predicates[global.memory.predicateId];\n\n          if (predicate) preprocessor.commit(predicate[3]);\n          clearPredicate();\n        } else if (\n          event.code == \"ControlLeft\" ||\n          event.code == \"ControlRight\"\n        ) {\n          idle = !idle;\n        }\n\n        return;\n      }\n\n      if (event.key == \"GroupPrevious\" || event.key == \"GroupNext\") return;\n      if (idle) return;\n\n      var changed = preprocessor.process(event.key, \"keydown\");\n      var input = preprocessor.get_input();\n\n      // We update the predicates\n      if (!changed) return;\n\n      tooltipInputElement.innerText = \"📝 \" + input;\n\n      var predicates = translator.translate(input);\n      loadPredicates(predicates);\n      updatePredicate();\n    },\n    false,\n  );\n\n  // Make the tooltip follow the mouse.\n  textFieldElement.addEventListener(\n    \"keyup\",\n    (event) => {\n      var getCaretCoordinates = __webpack_require__(/*! textarea-caret */ \"./node_modules/textarea-caret/index.js\");\n      var caret = getCaretCoordinates(\n        textFieldElement,\n        textFieldElement.selectionEnd,\n      );\n\n      tooltip.style.top =\n        75 +\n        textFieldElement.offsetTop -\n        textFieldElement.scrollTop +\n        caret.top +\n        \"px\";\n      tooltip.style.left =\n        50 +\n        textFieldElement.offsetLeft -\n        textFieldElement.scrollLeft +\n        caret.left +\n        \"px\";\n    },\n    false,\n  );\n\n  // Make the tooltip active inside of the textfield.\n  [\"click\", \"touchstart\"].forEach((e) => {\n    textFieldElement.addEventListener(\n      e,\n      (event) => {\n        tooltipElement.classList.add(\"is-active\");\n        preprocessor.process(\"\", \"keydown\");\n      },\n      false,\n    );\n  });\n\n  // We start the processor.\n  requestAnimationFrame(processCommand);\n})();\n\n/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./node_modules/webpack/buildin/global.js */ \"./node_modules/webpack/buildin/global.js\")))\n\n//# sourceURL=webpack:///./index.js?");

/***/ }),

/***/ "./utils.js":
/*!******************!*\
  !*** ./utils.js ***!
  \******************/
/*! exports provided: tomlToJson, httpGet */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"tomlToJson\", function() { return tomlToJson; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"httpGet\", function() { return httpGet; });\n/* harmony import */ var afrim_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! afrim-js */ \"./node_modules/afrim-js/afrim_js.js\");\n\n\n// Convert TOML to JSON.\nfunction tomlToJson(data) {\n  return JSON.parse(Object(afrim_js__WEBPACK_IMPORTED_MODULE_0__[\"convert_toml_to_json\"])(data));\n}\n\n// Make a http get request.\n// HTTP because we want a fast request.\nasync function httpGet(url) {\n  return await new Promise((resolve, reject) => {\n    const http = __webpack_require__(/*! http */ \"./node_modules/stream-http/index.js\");\n    var req = http.get(url, (res) => {\n      if (res.statusCode !== 200) {\n        console.error(\n          `Did not get an OK from the server. Code: ${res.statusCode}`,\n        );\n        res.resume();\n        return;\n      }\n\n      var data = \"\";\n\n      res.on(\"data\", (chunk) => {\n        data += chunk;\n      });\n\n      res.on(\"close\", () => {\n        resolve(data);\n      });\n    });\n\n    req.on(\"error\", (err) => {\n      reject(err);\n    });\n  });\n}\n\n\n//# sourceURL=webpack:///./utils.js?");

/***/ }),

/***/ 0:
/*!**********************!*\
  !*** util (ignored) ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("/* (ignored) */\n\n//# sourceURL=webpack:///util_(ignored)?");

/***/ }),

/***/ 1:
/*!**********************!*\
  !*** util (ignored) ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("/* (ignored) */\n\n//# sourceURL=webpack:///util_(ignored)?");

/***/ }),

/***/ 2:
/*!********************************!*\
  !*** ./util.inspect (ignored) ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("/* (ignored) */\n\n//# sourceURL=webpack:///./util.inspect_(ignored)?");

/***/ })

}]);