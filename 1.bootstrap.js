(window["webpackJsonp"] = window["webpackJsonp"] || []).push([[1],{

/***/ "./config.js":
/*!*******************!*\
  !*** ./config.js ***!
  \*******************/
/*! exports provided: loadConfig */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* WEBPACK VAR INJECTION */(function(global) {/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"loadConfig\", function() { return loadConfig; });\n/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils */ \"./utils.js\");\n\n\n// Load the afrim configuration through an URL.\nasync function loadConfig(path) {\n  var toml = __webpack_require__(/*! toml */ \"./node_modules/toml/index.js\");\n  var content = await Object(_utils__WEBPACK_IMPORTED_MODULE_0__[\"HttpGet\"])(path).then((data) => toml.parse(data));\n  var auto_capitalize = false;\n\n  if (content.core) {\n    auto_capitalize = content.core.auto_capitalize || false;\n  }\n\n  if (typeof content.translation == \"object\") {\n    var items = await Object.entries(content.translation);\n\n    for (let item of items) {\n      var key = item[0];\n      var value = item[1];\n\n      // We extract the translation.\n      if (typeof value == \"object\") {\n        if (value.path) {\n          await loadConfig(new URL(value.path, path).href);\n        } else if (value.alias) {\n          var _ = null;\n\n          if (value.values) {\n            _ = value.values;\n          } else {\n            _ = [value.value];\n          }\n\n          for (let e of value.alias) {\n            global.memory.dictionary[e] = _;\n          }\n          global.memory.dictionary[key] = _;\n        }\n      } else {\n        global.memory.dictionary[key] = [value];\n      }\n    }\n  }\n\n  // We extract the data.\n  if (typeof content.data == \"object\") {\n    var items = await Object.entries(content.data);\n\n    for (let item of items) {\n      var key = item[0];\n      var value = item[1];\n\n      if (typeof value == \"object\") {\n        if (value.path) {\n          await loadConfig(new URL(value.path, path).href);\n        } else if (value.alias) {\n          for (let e of value.alias) {\n            global.memory.data[e] = value.value;\n\n            if (auto_capitalize) {\n              global.memory.data[e[0].toUpperCase() + e.slice(1)] =\n                value.value.toUpperCase();\n            }\n          }\n          global.memory.data[key] = value.value;\n\n          if (auto_capitalize) {\n            global.memory.data[key[0].toUpperCase() + key.slice(1)] =\n              value.value.toUpperCase();\n          }\n        }\n      } else {\n        global.memory.data[key] = value;\n      }\n    }\n  }\n}\n\n/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./node_modules/webpack/buildin/global.js */ \"./node_modules/webpack/buildin/global.js\")))\n\n//# sourceURL=webpack:///./config.js?");

/***/ }),

/***/ "./index.js":
/*!******************!*\
  !*** ./index.js ***!
  \******************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* WEBPACK VAR INJECTION */(function(global) {/* harmony import */ var afrim_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! afrim-js */ \"./node_modules/afrim-js/afrim_js.js\");\n/* harmony import */ var _config__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./config */ \"./config.js\");\n\n\n\nglobal.memory = Object({\n  predicates: Array(),\n  predicateId: 0,\n  pageSize: 5,\n  data: Object(),\n  dictionary: Object(),\n});\n\n(async function () {\n  // We download the datalang.\n  var lang = sessionStorage.getItem(\"lang\") || \"clafrica\";\n  document.getElementById(lang).classList.toggle(\"is-active\");\n  await Object(_config__WEBPACK_IMPORTED_MODULE_1__[\"loadConfig\"])(\n    `https://raw.githubusercontent.com/pythonbrad/afrim-data/master/${lang}/${lang}.toml`,\n  );\n\n  // We config the afrim ime.\n  var preprocessor = afrim_js__WEBPACK_IMPORTED_MODULE_0__[\"Preprocessor\"].new(global.memory.data, 64);\n  var translator = afrim_js__WEBPACK_IMPORTED_MODULE_0__[\"Translator\"].new(global.memory.dictionary, false);\n\n  var textFieldElement = document.getElementById(\"textfield\");\n  var tooltipElement = document.getElementById(\"tooltip\");\n  var tooltipTitleElement = document.getElementById(\"input\");\n  var predicatesElement = document.getElementById(\"predicates\");\n\n  var predicateHtml = predicatesElement.children[0].outerHTML;\n  var idle = false;\n\n  // Clear the predicates.\n  function clearPredicate() {\n    predicatesElement.innerHTML = \"\";\n    global.memory.predicateId = 0;\n    global.memory.predicates = Array();\n  }\n\n  // Update the predicates.\n  function updatePredicate() {\n    predicatesElement.innerHTML = \"\";\n\n    var counter = 0;\n    var predicates = global.memory.predicates\n      .slice(global.memory.predicateId, global.memory.predicates.length)\n      .concat(global.memory.predicates.slice(0, global.memory.predicateId));\n\n    for (let predicate of predicates) {\n      // Mark the selected predicate.\n      var c = counter == 0 ? \"✏️\" : \"\";\n\n      if (counter++ > global.memory.pageSize) break;\n      predicatesElement.innerHTML += predicateHtml.replace(\n        \"{{ predicate }}\",\n        `${c} ${predicate[2]} ~${predicate[1]}`,\n      );\n    }\n  }\n\n  // We listen keyboard events.\n  textFieldElement.addEventListener(\n    \"keyup\",\n    (event) => {\n      if (idle) return;\n      if (event.key == \"GroupPrevious\" || event.key == \"GroupNext\") return;\n\n      // We manage special keys.\n      if (event.ctrlKey) {\n        // Previous predicate.\n        if (event.code == \"ShiftLeft\") {\n          global.memory.predicateId =\n            global.memory.predicateId < 1\n              ? global.memory.predicates.length - 1\n              : global.memory.predicateId - 1;\n          updatePredicate();\n        }\n        // Next predicate.\n        else if (event.code == \"ShiftRight\") {\n          global.memory.predicateId =\n            global.memory.predicateId >= global.memory.predicates.length - 1\n              ? 0\n              : global.memory.predicateId + 1;\n          updatePredicate();\n        }\n        // Commit the predicate.\n        else if (event.code == \"Space\") {\n          preprocessor.commit(\n            global.memory.predicates[global.memory.predicateId][2],\n          );\n          clearPredicate();\n        }\n      }\n\n      var changed = preprocessor.process(event.key, \"keydown\");\n      var input = preprocessor.get_input();\n\n      // We update the predicates\n      if (changed) {\n        clearPredicate();\n        var counter = 0;\n        var predicates = translator.translate(input);\n\n        for (let predicate of predicates) {\n          for (let e of predicate[2]) {\n            global.memory.predicates.push([\n              predicate[0],\n              predicate[1],\n              e,\n              predicate[3],\n            ]);\n          }\n        }\n\n        updatePredicate();\n      }\n\n      // We execute preprocessor commands.\n      while (1) {\n        var cmd = preprocessor.pop_stack();\n        tooltipTitleElement.innerText = \"📝 \" + input;\n\n        if (cmd.startsWith(\"!\")) {\n          if (cmd == \"!backspace\") {\n            textFieldElement.value = textfield.value.slice(0, -1);\n          } else if (cmd == \"!pause\") {\n            idle = true;\n          } else if (cmd == \"!resume\") {\n            idle = false;\n          }\n        } else if (cmd == \".\") break;\n        else {\n          textFieldElement.value += cmd;\n        }\n      }\n    },\n    false,\n  );\n\n  // Make the tooltip follow the mouse.\n  textFieldElement.addEventListener(\"mousemove\", (event) => {\n    tooltip.style.left = event.pageX + 10 + \"px\";\n    tooltip.style.top = event.pageY + 10 + \"px\";\n  });\n\n  // Make the tooltip inactive outside of the textfield.\n  textFieldElement.addEventListener(\"mouseout\", (event) => {\n    tooltipElement.classList.remove(\"is-active\");\n  });\n\n  // Make the tooltip active inside of the textfield.\n  textFieldElement.addEventListener(\"mouseover\", (event) => {\n    tooltipElement.classList.add(\"is-active\");\n  });\n})();\n\n/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./node_modules/webpack/buildin/global.js */ \"./node_modules/webpack/buildin/global.js\")))\n\n//# sourceURL=webpack:///./index.js?");

/***/ }),

/***/ "./utils.js":
/*!******************!*\
  !*** ./utils.js ***!
  \******************/
/*! exports provided: HttpGet */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"HttpGet\", function() { return HttpGet; });\n// Make a http get request.\nasync function HttpGet(url) {\n  return await new Promise((resolve, reject) => {\n    const https = __webpack_require__(/*! http */ \"./node_modules/stream-http/index.js\");\n    var req = https.get(url, (res) => {\n      if (res.statusCode !== 200) {\n        console.error(\n          `Did not get an OK from the server. Code: ${res.statusCode}`,\n        );\n        res.resume();\n        return;\n      }\n\n      var data = \"\";\n\n      res.on(\"data\", (chunk) => {\n        data += chunk;\n      });\n\n      res.on(\"close\", () => {\n        resolve(data);\n      });\n    });\n\n    req.on(\"error\", (err) => {\n      reject(err);\n    });\n  });\n}\n\n\n//# sourceURL=webpack:///./utils.js?");

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