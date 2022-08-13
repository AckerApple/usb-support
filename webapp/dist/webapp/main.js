(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["main"],{

/***/ "/2eP":
/*!******************************!*\
  !*** ../src/shared/enums.ts ***!
  \******************************/
/*! exports provided: SocketMessageType */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SocketMessageType", function() { return SocketMessageType; });
var SocketMessageType;
(function (SocketMessageType) {
    // client side
    SocketMessageType["UNSUBSCRIBEDEVICE"] = "unsubscribeDevice";
    SocketMessageType["LISTENTODEVICE"] = "listenToDevice";
    SocketMessageType["WRITETODEVICE"] = "writeToDevice";
    SocketMessageType["REFRESH"] = "refresh";
    SocketMessageType["GETSAVEDCONTROLLERS"] = "getSavedControllers";
    SocketMessageType["SAVECONTROLLERS"] = "save_controllers";
    // server side
    SocketMessageType["DEVICEEVENT_CHANGE"] = "deviceEvent.change";
    SocketMessageType["LISTENERS"] = "listeners";
    SocketMessageType["SAVEDCONTROLLERS"] = "savedControllers";
    SocketMessageType["DEVICES"] = "devices";
    SocketMessageType["ERROR"] = "error";
})(SocketMessageType || (SocketMessageType = {}));


/***/ }),

/***/ 0:
/*!***************************!*\
  !*** multi ./src/main.ts ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! /Users/ackerapple/projects/services/usb-support/webapp/src/main.ts */"zUnb");


/***/ }),

/***/ "0L1a":
/*!*******************************************!*\
  !*** ./src/app/mapController.function.ts ***!
  \*******************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return mapController; });
/* harmony import */ var _src_shared_delayLog_function__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../src/shared/delayLog.function */ "En4g");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rxjs */ "qCKp");


function mapController(gameController) {
    return new Promise(res => () => {
        const subs = new rxjs__WEBPACK_IMPORTED_MODULE_1__["Subscription"]();
        const gcChangeListener = new GameControlChangeListener(gameController);
        this.subs.add(gameController.notIdle.subscribe(() => gcChangeListener.handler()), gcChangeListener.completed.subscribe(() => {
            subs.unsubscribe();
            res();
        }));
        gcChangeListener.askForButton();
    });
}
class GameControlChangeListener {
    constructor(gameController) {
        this.gameController = gameController;
        this.completed = new rxjs__WEBPACK_IMPORTED_MODULE_1__["Subject"]();
    }
    getNextQuestion() {
        return Object.keys(this.gameController.map).find((key) => this.gameController.map[key] === null);
    }
    askForButton() {
        const key = this.getNextQuestion();
        Object(_src_shared_delayLog_function__WEBPACK_IMPORTED_MODULE_0__["default"])("\x1b[36mPush the " + key + " key\x1b[0m");
    }
    // listener from button press
    handler() {
        const data = this.gameController.lastData;
        const key = this.getNextQuestion();
        const diffs = this.gameController.filterIdleDifferences(data);
        const diffKeys = Object.keys(diffs);
        const map = this.gameController.map;
        if (diffKeys.length === 0) {
            return;
        }
        else if (diffKeys.length > 1) {
            console.log("multiple buttons activated");
        }
        else {
            const pos = Number(diffKeys[0]);
            const value = diffs[diffKeys[0]];
            const alreadySet = Object.keys(map).find((key) => map[key] && map[key].pos === pos && map[key].value === value);
            if (alreadySet) {
                console.log("Key already set: " + alreadySet, { pos, value });
            }
            else {
                this.gameController.map[key] = {
                    pos, value, idle: this.gameController.idle[pos], updatedAt: Date.now()
                };
                // console.log(gameController.map);
                console.log("SAVED KEY: " + key + " as ", { pos, value });
            }
        }
        console.log();
        if (this.getNextQuestion()) {
            this.askForButton();
        }
        else {
            console.log("Buttons mapped", this.gameController.map);
            this.completed.next();
        }
    }
}


/***/ }),

/***/ "AytR":
/*!*****************************************!*\
  !*** ./src/environments/environment.ts ***!
  \*****************************************/
/*! exports provided: environment */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "environment", function() { return environment; });
// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
const environment = {
    production: false
};
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.


/***/ }),

/***/ "En4g":
/*!******************************************!*\
  !*** ../src/shared/delayLog.function.ts ***!
  \******************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return delayLog; });
function delayLog(...args) {
    setTimeout(() => console.log(...args), 300);
}


/***/ }),

/***/ "O0UH":
/*!*********************************!*\
  !*** ../src/shared/config.json ***!
  \*********************************/
/*! exports provided: socketPort, socketHost, default */
/***/ (function(module) {

module.exports = JSON.parse("{\"socketPort\":8081,\"socketHost\":\"0.0.0.0\"}");

/***/ }),

/***/ "R2Xm":
/*!******************************!*\
  !*** ./src/app/app.utils.ts ***!
  \******************************/
/*! exports provided: testController, download, copyText */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "testController", function() { return testController; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "download", function() { return download; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "copyText", function() { return copyText; });
const testController = {
    path: 'test-path',
    interface: -1,
    usage: -1,
    usagePage: -1,
    productId: -1,
    vendorId: -32,
    product: 'test-product',
    manufacturer: 'test-manu',
};
function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}
function copyText(text) {
    /* Get the text field */
    var copyText = document.createElement('textarea');
    copyText.value = text;
    document.body.appendChild(copyText);
    /* Select the text field */
    copyText.select();
    copyText.setSelectionRange(0, 99999); /* For mobile devices */
    /* Copy the text inside the text field */
    document.execCommand("copy");
    document.body.removeChild(copyText);
    // copyText.parentNode.removeChild(copyText)
}


/***/ }),

/***/ "Sy1n":
/*!**********************************!*\
  !*** ./src/app/app.component.ts ***!
  \**********************************/
/*! exports provided: AppComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppComponent", function() { return AppComponent; });
/* harmony import */ var _src_shared_enums__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../src/shared/enums */ "/2eP");
/* harmony import */ var _mapController_function__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./mapController.function */ "0L1a");
/* harmony import */ var _src_shared_config_json__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../src/shared/config.json */ "O0UH");
var _src_shared_config_json__WEBPACK_IMPORTED_MODULE_2___namespace = /*#__PURE__*/__webpack_require__.t(/*! ../../../src/shared/config.json */ "O0UH", 1);
/* harmony import */ var _relayPositions__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./relayPositions */ "jC4L");
/* harmony import */ var _src_shared_index_utils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../src/shared/index.utils */ "neOj");
/* harmony import */ var _src_shared_decodeControllerButtonStates_function__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../src/shared/decodeControllerButtonStates.function */ "oCL0");
/* harmony import */ var ack_x_js_ack__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ack-x/js/ack */ "4/WS");
/* harmony import */ var ack_x_js_ack__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(ack_x_js_ack__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var _app_utils__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./app.utils */ "R2Xm");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @angular/common */ "ofXK");










function AppComponent_div_0_Template(rf, ctx) { if (rf & 1) {
    const _r10 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](0, "div", 20);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](1, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](2, " \u26A0\uFE0F Not connected to websocket server ");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](3, "a", 21);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵlistener"]("click", function AppComponent_div_0_Template_a_click_3_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵrestoreView"](_r10); const ctx_r9 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"](); return ctx_r9.reconnect(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](4, "\uD83D\uDD04");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
} }
function AppComponent_a_9_Template(rf, ctx) { if (rf & 1) {
    const _r13 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](0, "a", 22);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵlistener"]("click", function AppComponent_a_9_Template_a_click_0_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵrestoreView"](_r13); const item_r11 = ctx.$implicit; const ctx_r12 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"](); return ctx_r12.listenToDevice(item_r11); });
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](2, "div", 23);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
} if (rf & 2) {
    const item_r11 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵstyleProp"]("background-color", item_r11.subscribed && "blue")("color", item_r11.subscribed && "white");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtextInterpolate1"](" ", item_r11.product || item_r11.productId + ":" + item_r11.vendorId, " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtextInterpolate"](item_r11.manufacturer);
} }
function AppComponent_textarea_12_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](0, "textarea", 24);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpipe"](2, "json");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpipeBind1"](2, 1, ctx_r2.controllers));
} }
function AppComponent_div_13_div_1_button_9_Template(rf, ctx) { if (rf & 1) {
    const _r23 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](0, "button", 27);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵlistener"]("click", function AppComponent_div_13_div_1_button_9_Template_button_click_0_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵrestoreView"](_r23); const device_r15 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"]().$implicit; return device_r15.idle = device_r15.lastEvent; });
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](1, "capture idle");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
} }
function AppComponent_div_13_div_1_button_10_Template(rf, ctx) { if (rf & 1) {
    const _r26 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](0, "button", 27);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵlistener"]("click", function AppComponent_div_13_div_1_button_10_Template_button_click_0_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵrestoreView"](_r26); const device_r15 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"]().$implicit; const ctx_r24 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"](2); return ctx_r24.toggleDeviceRecord(device_r15); });
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](1, "\uD83C\uDFA4 record");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
} if (rf & 2) {
    const device_r15 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵclassProp"]("bg-warning", device_r15.recording);
} }
function AppComponent_div_13_div_1_div_16_Template(rf, ctx) { if (rf & 1) {
    const _r32 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](0, "div", 38);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵlistener"]("click", function AppComponent_div_13_div_1_div_16_Template_div_click_0_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵrestoreView"](_r32); const index_r29 = ctx.index; const device_r15 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"]().$implicit; const ctx_r30 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"](2); return ctx_r30.toggleIgnoreDeviceBit(device_r15, index_r29); });
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpipe"](2, "slice");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
} if (rf & 2) {
    const value_r28 = ctx.$implicit;
    const index_r29 = ctx.index;
    const device_r15 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵclassProp"]("bg-danger", device_r15.ignoreBits == null ? null : device_r15.ignoreBits.includes(index_r29));
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpipeBind2"](2, 3, "000" + value_r28, -3));
} }
function AppComponent_div_13_div_1_ng_container_20_Template(rf, ctx) { if (rf & 1) {
    const _r37 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](1, "div", 39);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](2, "input", 40);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵlistener"]("change", function AppComponent_div_13_div_1_ng_container_20_Template_input_change_2_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵrestoreView"](_r37); const button_r34 = ctx.$implicit; const device_r15 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"]().$implicit; const ctx_r35 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"](2); return ctx_r35.changeMapKeyName(button_r34.key, $event.target.value, device_r15.map); });
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](3, "a", 41);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵlistener"]("click", function AppComponent_div_13_div_1_ng_container_20_Template_a_click_3_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵrestoreView"](_r37); const button_r34 = ctx.$implicit; const device_r15 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"]().$implicit; const ctx_r38 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"](2); return ctx_r38.removeKeyFromMap(button_r34.key, device_r15.map); });
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](4, "\uD83D\uDDD1");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementContainerEnd"]();
} if (rf & 2) {
    const button_r34 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵclassProp"]("bg-energized", button_r34.value.pressed);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("value", button_r34.key);
} }
function AppComponent_div_13_div_1_div_32_div_6_Template(rf, ctx) { if (rf & 1) {
    const _r44 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](1, "a", 43);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵlistener"]("click", function AppComponent_div_13_div_1_div_32_div_6_Template_a_click_1_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵrestoreView"](_r44); const pos_r41 = ctx.$implicit; const device_r15 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"](2).$implicit; const ctx_r42 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"](2); return ctx_r42.writeToDevice(device_r15, ctx_r42.relayOn[pos_r41]); });
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](3, "a", 43);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵlistener"]("click", function AppComponent_div_13_div_1_div_32_div_6_Template_a_click_3_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵrestoreView"](_r44); const pos_r41 = ctx.$implicit; const device_r15 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"](2).$implicit; const ctx_r45 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"](2); return ctx_r45.writeToDevice(device_r15, ctx_r45.relayOff[pos_r41]); });
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
} if (rf & 2) {
    const pos_r41 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtextInterpolate1"]("", pos_r41, " on");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtextInterpolate1"]("", pos_r41, " off");
} }
const _c0 = function () { return [1, 2, 3, 4, 5, 6, 7, 8]; };
function AppComponent_div_13_div_1_div_32_Template(rf, ctx) { if (rf & 1) {
    const _r49 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](0, "div", 42);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](1, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](2, "a", 43);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵlistener"]("click", function AppComponent_div_13_div_1_div_32_Template_a_click_2_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵrestoreView"](_r49); const device_r15 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"]().$implicit; const ctx_r47 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"](2); return ctx_r47.writeToDevice(device_r15, ctx_r47.relayOn[0]); });
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](3, "all on");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](4, "a", 43);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵlistener"]("click", function AppComponent_div_13_div_1_div_32_Template_a_click_4_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵrestoreView"](_r49); const device_r15 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"]().$implicit; const ctx_r50 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"](2); return ctx_r50.writeToDevice(device_r15, ctx_r50.relayOff[0]); });
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](5, "all off");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](6, AppComponent_div_13_div_1_div_32_div_6_Template, 5, 2, "div", 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
} if (rf & 2) {
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngForOf", _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpureFunction0"](1, _c0));
} }
function AppComponent_div_13_div_1_Template(rf, ctx) { if (rf & 1) {
    const _r53 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](1, "h4");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](3, "textarea", 25);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵlistener"]("change", function AppComponent_div_13_div_1_Template_textarea_change_3_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵrestoreView"](_r53); const ctx_r52 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"](2); return ctx_r52.stringUpdateSavedController($event.target.value); });
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpipe"](5, "json");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](6, "div", 26);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](7, "button", 27);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵlistener"]("click", function AppComponent_div_13_div_1_Template_button_click_7_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵrestoreView"](_r53); const device_r15 = ctx.$implicit; const ctx_r54 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"](2); return ctx_r54.saveController(device_r15); });
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](8, "\uD83D\uDCBE save");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](9, AppComponent_div_13_div_1_button_9_Template, 2, 0, "button", 28);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](10, AppComponent_div_13_div_1_button_10_Template, 2, 2, "button", 29);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](11, "button", 27);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵlistener"]("click", function AppComponent_div_13_div_1_Template_button_click_11_listener() { const device_r15 = ctx.$implicit; return device_r15.map = {}; });
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](12, "\u21A9\uFE0F reset");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](13, "h4");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](14, "\uD83D\uDCCD button bit map");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](15, "div", 30);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](16, AppComponent_div_13_div_1_div_16_Template, 3, 6, "div", 31);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](17, "h4");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](18, "\uD83D\uDCCD button name map");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](19, "div", 32);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](20, AppComponent_div_13_div_1_ng_container_20_Template, 5, 3, "ng-container", 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpipe"](21, "keyvalue");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](22, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](23, "div", 33);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](24, "h3");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](25, "writeToDevice");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](26, "sup", 34);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](27, "(beta)");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](28, "div", 35);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](29, "input", 36);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵlistener"]("change", function AppComponent_div_13_div_1_Template_input_change_29_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵrestoreView"](_r53); const ctx_r56 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"](2); return ctx_r56.command = $event.target.value; });
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](30, "button", 3);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵlistener"]("click", function AppComponent_div_13_div_1_Template_button_click_30_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵrestoreView"](_r53); const device_r15 = ctx.$implicit; const ctx_r57 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"](2); return ctx_r57.writeToDeviceByString(device_r15, ctx_r57.command.split(",")); });
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](31, "send");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](32, AppComponent_div_13_div_1_div_32_Template, 7, 2, "div", 37);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
} if (rf & 2) {
    const device_r15 = ctx.$implicit;
    const ctx_r14 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtextInterpolate"](device_r15.meta.product || device_r15.meta.productId + ":" + device_r15.meta.vendorId);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵstyleProp"]("height", 25 * ctx_r14.listeners.length, "em");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpipeBind1"](5, 10, device_r15));
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngIf", device_r15.lastEvent);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngIf", device_r15.idle);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngForOf", device_r15.lastEvent);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngForOf", _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpipeBind1"](21, 12, device_r15.map));
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](9);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("value", ctx_r14.command);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngIf", device_r15.meta.product.toLowerCase().search("relay") >= 0);
} }
function AppComponent_div_13_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](0, "div", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](1, AppComponent_div_13_div_1_Template, 33, 14, "div", 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngForOf", ctx_r3.listeners);
} }
function AppComponent_button_18_Template(rf, ctx) { if (rf & 1) {
    const _r60 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](0, "button", 44);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵlistener"]("click", function AppComponent_button_18_Template_button_click_0_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵrestoreView"](_r60); const item_r58 = ctx.$implicit; const ctx_r59 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"](); return ctx_r59.listenToDevice(item_r58); });
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
} if (rf & 2) {
    const item_r58 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵstyleProp"]("background-color", item_r58.subscribed && "blue")("color", item_r58.subscribed && "white");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtextInterpolate1"](" ", item_r58.product || item_r58.productId + ":" + item_r58.vendorId, " ");
} }
function AppComponent_textarea_21_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](0, "textarea", 24);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpipe"](2, "json");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpipeBind1"](2, 1, ctx_r5.nonControllers));
} }
function AppComponent_ng_container_26_button_1_Template(rf, ctx) { if (rf & 1) {
    const _r65 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](0, "button", 46);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵlistener"]("click", function AppComponent_ng_container_26_button_1_Template_button_click_0_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵrestoreView"](_r65); const item_r63 = ctx.$implicit; const ctx_r64 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"](2); return ctx_r64.savedController = item_r63.value; });
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
} if (rf & 2) {
    const item_r63 = ctx.$implicit;
    const ctx_r62 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵstyleProp"]("background-color", ctx_r62.savedController === item_r63.value && "blue" || null)("color", ctx_r62.savedController === item_r63.value && "white" || null);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtextInterpolate1"](" ", item_r63.value.meta.product || item_r63.value.meta.productId + ":" + item_r63.value.meta.vendorId, " ");
} }
function AppComponent_ng_container_26_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](1, AppComponent_ng_container_26_button_1_Template, 2, 5, "button", 45);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpipe"](2, "keyvalue");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementContainerEnd"]();
} if (rf & 2) {
    const vendor_r61 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngForOf", _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpipeBind1"](2, 1, vendor_r61.value));
} }
function AppComponent_div_28_Template(rf, ctx) { if (rf & 1) {
    const _r67 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](0, "div", 12);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](1, "h3");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](3, "p");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](4, "Details of past connected and saved controllers");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](5, "textarea", 25);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵlistener"]("change", function AppComponent_div_28_Template_textarea_change_5_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵrestoreView"](_r67); const ctx_r66 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"](); return ctx_r66.stringUpdateSavedController(ctx_r66.savedController, $event.target.value); });
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpipe"](7, "json");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](8, "button", 21);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵlistener"]("click", function AppComponent_div_28_Template_button_click_8_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵrestoreView"](_r67); const ctx_r68 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"](); return ctx_r68.saveControllers(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](9, "save");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](10, "button", 21);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵlistener"]("click", function AppComponent_div_28_Template_button_click_10_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵrestoreView"](_r67); const ctx_r69 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"](); return ctx_r69.downloadController(ctx_r69.savedController); });
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](11, "download");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](12, "button", 21);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵlistener"]("click", function AppComponent_div_28_Template_button_click_12_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵrestoreView"](_r67); const ctx_r70 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"](); return ctx_r70.copyController(ctx_r70.savedController); });
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](13, "copy");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](14, "button", 21);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵlistener"]("click", function AppComponent_div_28_Template_button_click_14_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵrestoreView"](_r67); const ctx_r71 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"](); return ctx_r71.confirmDeleteController(ctx_r71.savedController); });
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](15, "delete");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r7 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtextInterpolate1"]("Saved Controller: ", ctx_r7.savedController.meta.product || ctx_r7.savedController.meta.productId + ":" + ctx_r7.item.value.meta.vendorId, "");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpipeBind1"](7, 2, ctx_r7.savedController));
} }
function AppComponent_div_29_p_3_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](0, "p");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r72 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtextInterpolate"](ctx_r72.debug.lastLogs.error.message);
} }
function AppComponent_div_29_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](0, "div", 47);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](1, "h3");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](2, "Recent error occurred");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](3, AppComponent_div_29_p_3_Template, 2, 1, "p", 48);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](4, "textarea", 49);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpipe"](6, "json");
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r8 = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngIf", ctx_r8.debug.lastLogs.error.message);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpipeBind1"](6, 2, ctx_r8.debug.lastLogs.error));
} }
const socketHost = window.location.hostname;
class AppComponent {
    constructor() {
        this.title = 'webapp';
        this.wsUrl = `ws://${socketHost}:${_src_shared_config_json__WEBPACK_IMPORTED_MODULE_2__["socketPort"]}`;
        this.reconnectInterval = 4000;
        this.command = '0x00, 0xFE, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00';
        this.relayOn = _relayPositions__WEBPACK_IMPORTED_MODULE_3__["relayOn"];
        this.relayOff = _relayPositions__WEBPACK_IMPORTED_MODULE_3__["relayOff"];
        this.devices = [];
        this.listeners = [];
        this.controllers = [];
        this.nonControllers = [];
        this.savedControllers = {};
        this.debug = {
            state: 'initializing',
            messages: 0,
            url: this.wsUrl,
            socket: {},
            lastWssData: {},
            lastPayload: {},
            lastLogs: {
                info: {}
            }
        };
        this.debug.state = 'constructing';
        window.onerror = err => this.error(typeof (err) === 'string' ? new Error(err) : err);
    }
    ngOnInit() {
        this.log('connecting to websocket', this.wsUrl);
        try {
            this.reconnect();
            this.debug.state = 'constructed';
            this.log('web socket connected');
        }
        catch (err) {
            this.error(err, {
                message: 'Could not connect to web sockets',
            });
        }
    }
    reconnect() {
        if (this.reconnectInterval) {
            clearInterval(this.reconnectInterval);
        }
        this.connect();
        this.reconnectInterval = setInterval(() => {
            this.log({ message: 'attempting ws reconnect...' });
            this.connect();
        }, 3000);
    }
    connect() {
        this.connection = new WebSocket(this.wsUrl);
        this.connection.onopen = () => {
            this.log('web socket handshake successful');
            console.log('this.connection', this.connection);
            if (this.reconnectInterval) {
                clearInterval(this.reconnectInterval);
                delete this.reconnectInterval;
            }
            this.fetchUsbDevices();
            this.fetchSavedControllers();
            this.debug.state = 'socket opened';
            this.connection.onclose = () => {
                this.reconnect();
            };
        };
        this.connection.onerror = (ev) => {
            this.error('socket onerror', ev, { message: `Socket error` });
        };
        this.connection.onmessage = (e) => {
            this.debug.state = 'message-received';
            ++this.debug.messages;
            let data;
            try {
                data = JSON.parse(e.data);
                this.debug.lastWssData = data;
            }
            catch (err) {
                // console.log('e.data', e)
                this.error(err, 'client message failed');
                this.debug.socket.error = err;
            }
            try {
                this.handleMessage(data);
            }
            catch (err) {
                this.error({ error: err, data }, `error executing message ${data.type}`);
                throw err;
            }
        };
    }
    mapController(controller) {
        Object(_mapController_function__WEBPACK_IMPORTED_MODULE_1__["default"])(controller);
    }
    toggleDeviceRecord(deviceMeta) {
        deviceMeta.recording = !deviceMeta.recording;
    }
    devicesUpdate(data) {
        data.forEach((device, index) => {
            this.devices[index] = this.devices[index] || { meta: device, map: {} };
            this.devices[index].meta = device;
        });
        const devices = this.devices.map(device => device.meta);
        this.controllers = devices.filter(device => Object(_src_shared_index_utils__WEBPACK_IMPORTED_MODULE_4__["isDeviceController"])(device));
        this.nonControllers = devices.filter(device => !Object(_src_shared_index_utils__WEBPACK_IMPORTED_MODULE_4__["isDeviceController"])(device));
        this.log('🕹 controllers', this.controllers);
        this.log('⌨️ other devices', this.nonControllers);
    }
    handleMessage(data) {
        switch (data.type) {
            case _src_shared_enums__WEBPACK_IMPORTED_MODULE_0__["SocketMessageType"].DEVICES:
                this.devicesUpdate(data.data);
                break;
            case _src_shared_enums__WEBPACK_IMPORTED_MODULE_0__["SocketMessageType"].SAVEDCONTROLLERS:
                if (data.data) {
                    this.savedControllers = data.data;
                    this.log('💾 savedControllers', data.data);
                }
                break;
            case _src_shared_enums__WEBPACK_IMPORTED_MODULE_0__["SocketMessageType"].LISTENERS:
                this.onListeners(data.data);
                break;
            case _src_shared_enums__WEBPACK_IMPORTED_MODULE_0__["SocketMessageType"].DEVICEEVENT_CHANGE:
                this.onDeviceEventChange(data.data.event, data.data.device);
                break;
            case _src_shared_enums__WEBPACK_IMPORTED_MODULE_0__["SocketMessageType"].ERROR:
                this.error(data.data);
                break;
            default:
                this.warn('unknown event type', data.type);
        }
    }
    onListeners(devices) {
        this.log({ message: `listeners update received`, devices });
        console.log('this.listeners ===========>> 0', this.listeners[0]);
        this.listeners.length = devices.length;
        console.log('this.listeners ===========>> 1', this.listeners[0]);
        devices.forEach((device, index) => {
            this.listeners[index] = this.listeners[index] || {
                meta: device, subscribed: true, map: {}
            };
            console.log('this.listeners[index] ------>', this.listeners[index]);
            const saved = this.getControlConfigByDevice(device);
            console.log('saved ------>', saved);
            if (saved) {
                Object.assign(this.listeners[index], saved);
            }
            this.listeners[index].meta = device;
        });
        this.controllers.forEach(controller => {
            const find = this.listeners.find(lDevice => Object(_src_shared_index_utils__WEBPACK_IMPORTED_MODULE_4__["devicesMatch"])(controller, lDevice.meta));
            if (find) {
                return controller.subscribed = true;
            }
            delete controller.subscribed;
        });
    }
    getControlConfigByDevice(device) {
        return Object(_src_shared_index_utils__WEBPACK_IMPORTED_MODULE_4__["getControlConfigByDevice"])(this.savedControllers, device);
    }
    onDeviceEventChange(event, device) {
        const matchedListener = this.listeners.find(listener => Object(_src_shared_index_utils__WEBPACK_IMPORTED_MODULE_4__["devicesMatch"])(listener.meta, device));
        // no match? no work to do
        if (!matchedListener) {
            return;
        }
        matchedListener.lastEvent = event;
        const listener = this.getDeviceListener(device);
        if (listener) {
            this.processDeviceUpdate(matchedListener);
        }
    }
    getDeviceListener(device) {
        return this.listeners.find(listener => Object(_src_shared_index_utils__WEBPACK_IMPORTED_MODULE_4__["devicesMatch"])(listener.meta, device));
    }
    processDeviceUpdate(matchedListener) {
        const pressedKeyNames = Object(_src_shared_decodeControllerButtonStates_function__WEBPACK_IMPORTED_MODULE_5__["default"])(matchedListener, matchedListener.lastEvent);
        matchedListener.pressed = pressedKeyNames;
        matchedListener.map = matchedListener.map || {};
        if (matchedListener.recording && !pressedKeyNames.length) {
            this.recordDeviceEvent(matchedListener);
        }
        // loop each known button and set its pressed property
        Object.entries(matchedListener.map).forEach(([key, buttonMap]) => {
            buttonMap.pressed = pressedKeyNames.includes(key);
        });
        document.getElementById('buttonChangeAudio').play();
    }
    recordDeviceEvent(matchedListener) {
        const idleMap = matchedListener.idle;
        const pressedKeyNames = matchedListener.pressed;
        const isIdle = Object(_src_shared_index_utils__WEBPACK_IMPORTED_MODULE_4__["eventsMatch"])(matchedListener.lastEvent, idleMap);
        if (isIdle) {
            return;
        }
        const event = matchedListener.lastEvent;
        for (let index = event.length - 1; index >= 0; --index) {
            if (event[index] != idleMap[index]) {
                matchedListener.map[`unknown${Object.keys(matchedListener.map).length}`] = {
                    pos: index,
                    value: event[index],
                    idle: idleMap[index],
                    updatedAt: Date.now(),
                };
            }
        }
        console.log('5 recording event came in', {
            map: matchedListener.map, pressedKeyNames, lastEvent: matchedListener.lastEvent
        });
    }
    confirmDeleteController(controller) {
        if (!confirm(`confirm delete ${Object(_src_shared_index_utils__WEBPACK_IMPORTED_MODULE_4__["getDeviceLabel"])(controller.meta)}`)) {
            return;
        }
        const vendorId = String(controller.meta.vendorId);
        const productId = String(controller.meta.productId);
        const products = this.savedControllers[vendorId];
        delete products[productId];
        this.saveControllers();
    }
    saveController(controller) {
        const vendorId = controller.meta.vendorId;
        const products = this.savedControllers[vendorId] = this.savedControllers[vendorId] || {};
        const productId = controller.meta.productId;
        const saveData = controllerSaveFormat(controller);
        products[productId] = saveData; // update local info
        this.saveControllers();
    }
    saveControllers() {
        const controllers = {};
        Object.keys(this.savedControllers).forEach(vendorId => {
            const products = this.savedControllers[vendorId];
            controllers[vendorId] = controllers[vendorId] || {};
            Object.keys(products).forEach(productId => {
                const product = this.savedControllers[vendorId][productId];
                controllers[vendorId][productId] = controllerSaveFormat(product);
            });
        });
        this.wssSend(_src_shared_enums__WEBPACK_IMPORTED_MODULE_0__["SocketMessageType"].SAVECONTROLLERS, controllers);
    }
    addTestController() {
        this.controllers.push(_app_utils__WEBPACK_IMPORTED_MODULE_7__["testController"]);
        this.devices.push({
            map: {},
            subscribed: false,
            lastEvent: [],
            meta: _app_utils__WEBPACK_IMPORTED_MODULE_7__["testController"]
        });
    }
    fetchSavedControllers() {
        this.wssSend(_src_shared_enums__WEBPACK_IMPORTED_MODULE_0__["SocketMessageType"].GETSAVEDCONTROLLERS);
    }
    wssSend(type, data) {
        const payload = { type, data };
        this.debug.lastPayload = payload;
        this.connection.send(JSON.stringify(payload));
        return this;
    }
    fetchUsbDevices() {
        this.wssSend(_src_shared_enums__WEBPACK_IMPORTED_MODULE_0__["SocketMessageType"].REFRESH);
    }
    getSavedControllers() {
        this.wssSend(_src_shared_enums__WEBPACK_IMPORTED_MODULE_0__["SocketMessageType"].GETSAVEDCONTROLLERS);
    }
    writeToDevice(device, command) {
        this.wssSend(_src_shared_enums__WEBPACK_IMPORTED_MODULE_0__["SocketMessageType"].WRITETODEVICE, { device: device.meta, command });
    }
    writeToDeviceByString(device, command) {
        const sendCommand = command.map(x => parseInt(Number(x.trim()), 10) || 0);
        this.writeToDevice(device, sendCommand);
    }
    toggleDeviceConnection(device) {
        const stringRef = Object(_src_shared_index_utils__WEBPACK_IMPORTED_MODULE_4__["getDeviceLabel"])(device);
        const deviceMatch = this.listeners.find(xDevice => Object(_src_shared_index_utils__WEBPACK_IMPORTED_MODULE_4__["devicesMatch"])(device, xDevice.meta));
        const controller = this.deviceToController(device);
        controller.subscribed = !deviceMatch;
        if (!deviceMatch) {
            this.log({
                message: `🦻 requesting web socket listen to ${stringRef}`
            });
            this.wssSend(_src_shared_enums__WEBPACK_IMPORTED_MODULE_0__["SocketMessageType"].LISTENTODEVICE, device);
            if (device === _app_utils__WEBPACK_IMPORTED_MODULE_7__["testController"]) {
                this.handleMessage({
                    type: _src_shared_enums__WEBPACK_IMPORTED_MODULE_0__["SocketMessageType"].LISTENERS,
                    data: {
                        devices: this.devices,
                        controllers: this.controllers,
                        event: { message: 'test-event' },
                        device
                    }
                });
            }
            return true;
        }
        this.log({
            message: `Unsubscribed from ${stringRef}`
        });
        this.wssSend(_src_shared_enums__WEBPACK_IMPORTED_MODULE_0__["SocketMessageType"].UNSUBSCRIBEDEVICE, device);
        return false;
    }
    listenToDevice(device) {
        // console.log('device', device)
        const stringRef = Object(_src_shared_index_utils__WEBPACK_IMPORTED_MODULE_4__["getDeviceLabel"])(device);
        this.log({
            message: `👂 attempting listen to ${stringRef}...`, device
        });
        const savedControllers = Object.values(this.savedControllers).reduce((all, current) => [...all, ...Object.values(current)], []);
        const savedController = savedControllers.find(xSaved => Object(_src_shared_index_utils__WEBPACK_IMPORTED_MODULE_4__["devicesMatch"])(device, xSaved.meta));
        if (savedController) {
            this.savedController = savedController;
        }
        // already connected so disconnect?
        this.toggleDeviceConnection(device);
    }
    deviceToController(device) {
        return this.controllers.find(control => Object(_src_shared_index_utils__WEBPACK_IMPORTED_MODULE_4__["devicesMatch"])(device, control));
    }
    error(error, ...extra) {
        if (typeof error === 'string') {
            error = new Error(error);
        }
        const readable = ack_x_js_ack__WEBPACK_IMPORTED_MODULE_6__["ackExpose"].error(error).toObject();
        this.debug.lastLogs.error = Object.assign(Object.assign(Object.assign({}, readable), error), extra.reduce((all, one) => (Object.assign(Object.assign({}, all), one)), {}));
        // console.log('lastLogs.error updated')
        console.error(Object.assign({ error }, extra));
    }
    warn(...data) {
        this.debug.lastLogs.info = data;
        console.warn(data);
    }
    log(...data) {
        this.debug.lastLogs.info = data;
        if (data[0].message) {
            return console.log(data[0].message, data);
        }
        console.log(data);
    }
    stringUpdateSavedController(newData) {
        this.savedController = JSON.parse(newData);
        this.saveController(this.savedController);
        this.listeners.forEach(listener => {
            if (Object(_src_shared_index_utils__WEBPACK_IMPORTED_MODULE_4__["devicesMatch"])(listener.meta, this.savedController.meta)) {
                Object.assign(listener, this.savedController);
            }
        });
    }
    toggleIgnoreDeviceBit(item, index) {
        console.log(0, item, index);
        item.ignoreBits = item.ignoreBits || [];
        const ignoreIndex = item.ignoreBits.indexOf(index);
        if (ignoreIndex === -1) {
            item.ignoreBits.push(index);
            console.log(1, item.ignoreBits);
            return;
        }
        item.ignoreBits.splice(ignoreIndex, 1);
        console.log(2, item.ignoreBits);
    }
    downloadController(controller) {
        const filename = Object(_src_shared_index_utils__WEBPACK_IMPORTED_MODULE_4__["getDeviceLabel"])(controller.meta) + '.json';
        const data = JSON.stringify(controller, null, 2);
        Object(_app_utils__WEBPACK_IMPORTED_MODULE_7__["download"])(filename, data);
    }
    copyController(controller) {
        Object(_app_utils__WEBPACK_IMPORTED_MODULE_7__["copyText"])(JSON.stringify(controller, null, 2));
    }
    removeKeyFromMap(key, map) {
        delete map[key];
    }
    changeMapKeyName(key, newKey, map) {
        map[newKey] = map[key];
        delete map[key];
    }
}
AppComponent.ɵfac = function AppComponent_Factory(t) { return new (t || AppComponent)(); };
AppComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵdefineComponent"]({ type: AppComponent, selectors: [["app-root"]], decls: 37, vars: 15, consts: [["class", "bg-warning pad flex-apart", 4, "ngIf"], [1, "flex-wrap", "child-pad-xs", "child-margin-xs"], [1, "flex-1", "border", "border-radius-10"], ["type", "button", 3, "click"], [1, "flex-wrap"], ["class", "flex1 block margin-xxs pad-xs border-1 radius-5 text-center", 3, "background-color", "color", "click", 4, "ngFor", "ngForOf"], [1, "text-center", "block", "pad", 3, "click"], ["class", "code", "wrap", "off", "disabled", "", 4, "ngIf"], ["class", "flex2 border border-radius-10", 4, "ngIf"], [1, "flex2", "border", "border-radius-10"], ["type", "button", "class", "margin-xxs flex1", 3, "background-color", "color", "click", 4, "ngFor", "ngForOf"], [1, "block", "pad", "text-center", 3, "click"], [1, "flex1", "border", "border-radius-10"], [4, "ngFor", "ngForOf"], ["class", "flex1 border border-radius-10", 4, "ngIf"], ["class", "flex2 border border-radius-10 bg-warning", 4, "ngIf"], ["title", "feedback audio is when a device change occurs an audio file will be played", 1, "flex-stacked", "flex-center", "pad", "text-xs"], ["id", "buttonChangeAudio", "controls", "", "width", "100", "height", "100"], ["src", "assets/LOZ_Get_Heart.wav"], [1, "opacity-70", "text-xxs"], [1, "bg-warning", "pad", "flex-apart"], [3, "click"], [1, "flex1", "block", "margin-xxs", "pad-xs", "border-1", "radius-5", "text-center", 3, "click"], [1, "text-xs"], ["wrap", "off", "disabled", "", 1, "code"], ["wrap", "off", 1, "code", 3, "change"], [1, "flex-wrap", "flex-valign-center", "child-margin-xxs"], [1, "flex1", 3, "click"], ["class", "flex1", 3, "click", 4, "ngIf"], ["class", "flex1", 3, "bg-warning", "click", 4, "ngIf"], [1, "flex-wrap", "flex-valign-center", "child-margin-1", "child-pad-xxs"], ["class", "border radius-5 cursor-pointer flex-1 text-center", 3, "bg-danger", "click", 4, "ngFor", "ngForOf"], [1, "flex-wrap", "child-margin-xxs"], [1, "flex-wrap", "flex-valign-center"], [1, "opacity-half", "pad-left"], [1, "child-pad", "child-margin"], ["type", "text", "placeholder", "comma separated", 3, "value", "change"], ["class", "child-margin flex-wrap flex-center", 4, "ngIf"], [1, "border", "radius-5", "cursor-pointer", "flex-1", "text-center", 3, "click"], [1, "flex", "flex-1"], [1, "flex1", "flex-valign-center", "flex-center", "border", "pad-xxs", "border-right-0", "radius-right-0", 3, "value", "change"], ["type", "button", 1, "hover-bg-assertive", "block", "border-1", "radius-right-5", "pad-xxs", 3, "click"], [1, "child-margin", "flex-wrap", "flex-center"], [1, "border", "radius-5", "pad-xs", "margin-xs", 3, "click"], ["type", "button", 1, "margin-xxs", "flex1", 3, "click"], ["type", "button", "class", "margin-xxs flex-1", 3, "background-color", "color", "click", 4, "ngFor", "ngForOf"], ["type", "button", 1, "margin-xxs", "flex-1", 3, "click"], [1, "flex2", "border", "border-radius-10", "bg-warning"], [4, "ngIf"], ["disabled", "", 1, "code"]], template: function AppComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](0, AppComponent_div_0_Template, 5, 0, "div", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](1, "div", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](2, "div", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](3, "h3");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](4, "\uD83D\uDD79 Choose Controller");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](5, "p");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](6, "button", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵlistener"]("click", function AppComponent_Template_button_click_6_listener() { return ctx.addTestController(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](7, "add test controller");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](8, "div", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](9, AppComponent_a_9_Template, 4, 6, "a", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](10, "a", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵlistener"]("click", function AppComponent_Template_a_click_10_listener() { return ctx.debug.controllers = !ctx.debug.controllers; });
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](11, "\uD83D\uDC1B debug json");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](12, AppComponent_textarea_12_Template, 3, 3, "textarea", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](13, AppComponent_div_13_Template, 2, 1, "div", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](14, "div", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](15, "h4");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](16, "\uD83C\uDFA7 \u2328\uFE0F Other Devices");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](17, "div", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](18, AppComponent_button_18_Template, 2, 5, "button", 10);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](19, "a", 11);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵlistener"]("click", function AppComponent_Template_a_click_19_listener() { return ctx.debug.devices = !ctx.debug.devices; });
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](20, "\uD83D\uDC1B debug json");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](21, AppComponent_textarea_21_Template, 3, 3, "textarea", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](22, "div", 12);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](23, "h4");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](24, "\uD83D\uDCBE Saved Controllers");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](25, "div", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](26, AppComponent_ng_container_26_Template, 3, 3, "ng-container", 13);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpipe"](27, "keyvalue");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](28, AppComponent_div_28_Template, 16, 4, "div", 14);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtemplate"](29, AppComponent_div_29_Template, 7, 4, "div", 15);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](30, "div", 16);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](31, "div");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](32, "\uD83D\uDD0A test feedback audio");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](33, "audio", 17);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelement"](34, "source", 18);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementStart"](35, "div", 19);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵtext"](36, "some devices require playing above audio one time before feedback audio will work");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngIf", (ctx.connection == null ? null : ctx.connection.readyState) !== 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](9);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngForOf", ctx.controllers);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵclassMap"](ctx.debug.controllers ? "bg-energized" : "bg-calm");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngIf", ctx.debug.controllers);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngIf", ctx.listeners.length);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](5);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngForOf", ctx.nonControllers);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵclassMap"](ctx.debug.devices ? "bg-energized" : "bg-calm");
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngIf", ctx.debug.devices);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](5);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngForOf", _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵpipeBind1"](27, 13, ctx.savedControllers));
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngIf", ctx.savedController);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_8__["ɵɵproperty"]("ngIf", ctx.debug.lastLogs.error);
    } }, directives: [_angular_common__WEBPACK_IMPORTED_MODULE_9__["NgIf"], _angular_common__WEBPACK_IMPORTED_MODULE_9__["NgForOf"]], pipes: [_angular_common__WEBPACK_IMPORTED_MODULE_9__["KeyValuePipe"], _angular_common__WEBPACK_IMPORTED_MODULE_9__["JsonPipe"], _angular_common__WEBPACK_IMPORTED_MODULE_9__["SlicePipe"]], styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJhcHAuY29tcG9uZW50LnNjc3MifQ== */", "textarea.code[_ngcontent-%COMP%] {\n    height:500px;width:100%;\n    min-width:300px;\n  }"] });
function controllerSaveFormat(controller) {
    const saveData = Object.assign({}, controller);
    delete saveData.lastEvent;
    delete saveData.subscribed;
    delete saveData.recording;
    delete saveData.pressed;
    return saveData;
}


/***/ }),

/***/ "ZAI4":
/*!*******************************!*\
  !*** ./src/app/app.module.ts ***!
  \*******************************/
/*! exports provided: AppModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppModule", function() { return AppModule; });
/* harmony import */ var _angular_platform_browser__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/platform-browser */ "jhN1");
/* harmony import */ var _app_routing_module__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./app-routing.module */ "vY5A");
/* harmony import */ var _app_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./app.component */ "Sy1n");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/core */ "fXoL");




class AppModule {
}
AppModule.ɵfac = function AppModule_Factory(t) { return new (t || AppModule)(); };
AppModule.ɵmod = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineNgModule"]({ type: AppModule, bootstrap: [_app_component__WEBPACK_IMPORTED_MODULE_2__["AppComponent"]] });
AppModule.ɵinj = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineInjector"]({ providers: [], imports: [[
            _angular_platform_browser__WEBPACK_IMPORTED_MODULE_0__["BrowserModule"],
            _app_routing_module__WEBPACK_IMPORTED_MODULE_1__["AppRoutingModule"]
        ]] });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵsetNgModuleScope"](AppModule, { declarations: [_app_component__WEBPACK_IMPORTED_MODULE_2__["AppComponent"]], imports: [_angular_platform_browser__WEBPACK_IMPORTED_MODULE_0__["BrowserModule"],
        _app_routing_module__WEBPACK_IMPORTED_MODULE_1__["AppRoutingModule"]] }); })();


/***/ }),

/***/ "ZPnb":
/*!********************************************************!*\
  !*** ../node_modules/moment-mini/locale sync ^\.\/.*$ ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var map = {
	"./locale": "bCXH",
	"./locale.js": "bCXH"
};


function webpackContext(req) {
	var id = webpackContextResolve(req);
	return __webpack_require__(id);
}
function webpackContextResolve(req) {
	if(!__webpack_require__.o(map, req)) {
		var e = new Error("Cannot find module '" + req + "'");
		e.code = 'MODULE_NOT_FOUND';
		throw e;
	}
	return map[req];
}
webpackContext.keys = function webpackContextKeys() {
	return Object.keys(map);
};
webpackContext.resolve = webpackContextResolve;
module.exports = webpackContext;
webpackContext.id = "ZPnb";

/***/ }),

/***/ "jC4L":
/*!***********************************!*\
  !*** ./src/app/relayPositions.ts ***!
  \***********************************/
/*! exports provided: relayOn, relayOff */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "relayOn", function() { return relayOn; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "relayOff", function() { return relayOff; });
const relayOn = [
    [0x00, 0xFE, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
    [0x00, 0xFF, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
    [0x00, 0xFF, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
    [0x00, 0xFF, 0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
    [0x00, 0xFF, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
    [0x00, 0xFF, 0x05, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
    [0x00, 0xFF, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
    [0x00, 0xFF, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
    [0x00, 0xFF, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]
];
const relayOff = [
    [0x00, 0xFC, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
    [0x00, 0xFD, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
    [0x00, 0xFD, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
    [0x00, 0xFD, 0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
    [0x00, 0xFD, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
    [0x00, 0xFD, 0x05, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
    [0x00, 0xFD, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
    [0x00, 0xFD, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
    [0x00, 0xFD, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]
];


/***/ }),

/***/ "neOj":
/*!************************************!*\
  !*** ../src/shared/index.utils.ts ***!
  \************************************/
/*! exports provided: getControlConfigByDevice, savedControllerToConfigs, isDeviceEventsSame, eventsMatch, cleanseDeviceEvent, devicesMatch, isDeviceController, getDeviceLabel, sumSets, getPressMapByController */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getControlConfigByDevice", function() { return getControlConfigByDevice; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "savedControllerToConfigs", function() { return savedControllerToConfigs; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isDeviceEventsSame", function() { return isDeviceEventsSame; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "eventsMatch", function() { return eventsMatch; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "cleanseDeviceEvent", function() { return cleanseDeviceEvent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "devicesMatch", function() { return devicesMatch; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isDeviceController", function() { return isDeviceController; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getDeviceLabel", function() { return getDeviceLabel; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sumSets", function() { return sumSets; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getPressMapByController", function() { return getPressMapByController; });
/** Files in here must be browser safe */
function getControlConfigByDevice(configs, device) {
    const vendorId = String(device.vendorId);
    const productId = String(device.productId);
    const products = configs[vendorId];
    if (!products) {
        return;
    }
    return products[productId];
}
function savedControllerToConfigs(controller, controlConfigs = {}) {
    const { vendorId, productId } = controller.meta;
    const vendorOb = controlConfigs[vendorId] = controlConfigs[vendorId] || {};
    vendorOb[productId] = controller;
    return controlConfigs;
}
function isDeviceEventsSame(device, event0, event1) {
    const castedEvent0 = cleanseDeviceEvent(device, event0);
    const castedEvent1 = cleanseDeviceEvent(device, event1);
    return eventsMatch(castedEvent0, castedEvent1);
}
function eventsMatch(event0, event1) {
    return event0.every((item, index) => item === event1[index]);
}
function cleanseDeviceEvent(device, event) {
    return event.map((number, index) => cleanseDeviceEventPos(device, number, index));
}
function cleanseDeviceEventPos(device, number, index) {
    var _a;
    return ((_a = device.ignoreBits) === null || _a === void 0 ? void 0 : _a.includes(index)) ? 0 : number;
}
function devicesMatch(device, lDevice) {
    if (device === lDevice) {
        return true; // exact match
    }
    return device.path === lDevice.path;
    /*
    device.productId === lDevice.productId && device.vendorId === lDevice.vendorId
    && device.manufacturer === lDevice.manufacturer
    && device.product === lDevice.product
    */
}
function isDeviceController(device) {
    if ((device.usage === 5 && device.usagePage === 1)
        || (device.usage === 4 && device.usagePage === 1)) {
        return true;
    }
    if (!device.product) {
        return false;
    }
    return device.product.toLowerCase().indexOf("controller") >= 0
        || device.product.toLowerCase().indexOf("game") >= 0
        || device.product.toLowerCase().indexOf("joystick") >= 0;
}
function getDeviceLabel(device) {
    var _a;
    let stringRef = ((_a = device.product) === null || _a === void 0 ? void 0 : _a.trim()) || '';
    if (device.manufacturer) {
        stringRef += ' by ' + device.manufacturer;
    }
    return stringRef;
}
/** returns every combination of combing positions of an array */
function sumSets(numsToSum, $sum = (items) => items.reduce((a, b) => a + b, 0)) {
    var sums = []; // every possible sum (typically single number value)
    var sets = []; // each index matches sums (the items in sum)
    getCombinations(numsToSum).forEach(read => {
        const total = $sum(read); // read.reduce($sum as any, startValue) as any
        sums.push(total); // record result of combing
        sets.push(read.slice()); // clone read array
    });
    /*
    function SubSets(
      read: W[], // starts with no values
      queued: W[] // starts with all values
    ) {
      if (read.length) {
        const total = $sum(read)// read.reduce($sum as any, startValue) as any
        sums.push(total) // record result of combing
        sets.push(read.slice()) // clone read array
      }
  
      if (read.length > 1) {
        SubSets(read.slice(1), [])
      }
  
      if (queued.length === 0) {
        return
      }
  
      const next = queued[0]
  
      const left = queued.slice(1)
      const newReads = [...read, next]
      SubSets(newReads, left) // move one over at a time
    }
  
    // igniter
    SubSets([], numsToSum)
    */
    return { sums, sets };
}
/** a map of all possible button presses */
function getPressMapByController(controller) {
    const data = Object.entries(controller.map);
    const idle = controller.idle ? controller.idle : [0, 0, 0, 0, 0, 0, 0, 0];
    const results = sumSets(data, (items) => {
        const idleClone = idle.slice();
        const processor = (set) => {
            const item = set[1];
            idleClone[item.pos] = idleClone[item.pos] + item.value - item.idle;
        };
        items.forEach(processor);
        return idleClone;
    });
    const namedSets = results.sets.map(item => item.map(btn => btn[0]));
    const output = results.sums.reduce((all, now, index) => {
        all[now.join(' ')] = namedSets[index];
        return all;
    }, {});
    output[idle.join(' ')] = [];
    return output;
}
function getCombinations(valuesArray) {
    const combi = [];
    const slent = Math.pow(2, valuesArray.length);
    for (var i = 0; i < slent; i++) {
        const temp = [];
        for (var j = 0; j < valuesArray.length; j++) {
            if ((i & Math.pow(2, j))) {
                temp.push(valuesArray[j]);
            }
        }
        if (temp.length > 0) {
            combi.push(temp);
        }
    }
    return combi;
}


/***/ }),

/***/ "oCL0":
/*!**************************************************************!*\
  !*** ../src/shared/decodeControllerButtonStates.function.ts ***!
  \**************************************************************/
/*! exports provided: default, decodeDeviceMetaState, getSamePosButtons, findButtonCombo */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "decodeDeviceMetaState", function() { return decodeDeviceMetaState; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getSamePosButtons", function() { return getSamePosButtons; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "findButtonCombo", function() { return findButtonCombo; });
/* harmony import */ var _index_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./index.utils */ "neOj");

/* harmony default export */ __webpack_exports__["default"] = (decodeDeviceMetaState);
/** runtime decode button presses
 * - Todo: More performance using a map of all possible presses instead of using this
*/
function decodeDeviceMetaState(metaState, event // 8 bits
) {
    if (!metaState.map || !event) {
        return [];
    }
    const changedMap = getButtonMapByEvent(metaState.map, event);
    return Object.keys(changedMap).filter((buttonName) => {
        const current = changedMap[buttonName];
        const currentPos = current.pos;
        const seekValue = event[currentPos];
        // does another matching position have an exact match?
        const otherHasExact = Object.values(changedMap)
            .find(btnMap => btnMap.pos === currentPos && btnMap !== current && btnMap.value === seekValue);
        if (otherHasExact) {
            return false;
        }
        // direct value match
        if (current.value === seekValue) {
            return true;
        }
        // items on the same pos
        const alikes = getSamePosButtons(buttonName, changedMap);
        // combined value match
        const match = findButtonCombo(alikes, current, { changedMap, seekValue });
        if (match) {
            return true;
        }
        return false;
    });
}
function getSamePosButtons(buttonName, changedMap) {
    return Object.keys(changedMap)
        .filter(otherBtnName => {
        if (otherBtnName === buttonName) {
            return false;
        }
        if (changedMap[otherBtnName].pos !== changedMap[buttonName].pos) {
            return false;
        }
        return true;
    });
}
/** determines if multiple button pressed  */
function findButtonCombo(alikes, // two or more button names
current, { changedMap, seekValue }) {
    if (!alikes.length) {
        return false;
    }
    const x = [current];
    alikes.forEach(name => {
        x.push(changedMap[name]);
    });
    const results = Object(_index_utils__WEBPACK_IMPORTED_MODULE_0__["sumSets"])(x, (b) => {
        return b.reduce((a, b) => a + b.value - current.idle, 0);
    }); // get every possible combination
    return results.sets.find((items, index) => {
        // remove all singular possible combinations
        if (items.length === 1) {
            const isTheCurrentOne = items[0].value === current.value || items[0].value === current.value + current.idle;
            if (!isTheCurrentOne) {
                return false;
            }
        }
        // possible set must include current value
        if (!items.includes(current)) {
            return false;
        }
        if (seekValue === results.sums[index]) {
            return true;
        }
    }) !== undefined;
}
function getButtonMapByEvent(map, currentBits // length === 8
) {
    return currentBits.reduce((all, current, index) => {
        Object.keys(map)
            .filter((buttonName) => map[buttonName].pos === index && map[buttonName].idle !== current)
            .forEach((buttonName) => all[buttonName] = map[buttonName]);
        return all;
    }, {});
}


/***/ }),

/***/ "vY5A":
/*!***************************************!*\
  !*** ./src/app/app-routing.module.ts ***!
  \***************************************/
/*! exports provided: AppRoutingModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppRoutingModule", function() { return AppRoutingModule; });
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/router */ "tyNb");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "fXoL");



const routes = [];
class AppRoutingModule {
}
AppRoutingModule.ɵfac = function AppRoutingModule_Factory(t) { return new (t || AppRoutingModule)(); };
AppRoutingModule.ɵmod = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineNgModule"]({ type: AppRoutingModule });
AppRoutingModule.ɵinj = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineInjector"]({ imports: [[_angular_router__WEBPACK_IMPORTED_MODULE_0__["RouterModule"].forRoot(routes)], _angular_router__WEBPACK_IMPORTED_MODULE_0__["RouterModule"]] });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵsetNgModuleScope"](AppRoutingModule, { imports: [_angular_router__WEBPACK_IMPORTED_MODULE_0__["RouterModule"]], exports: [_angular_router__WEBPACK_IMPORTED_MODULE_0__["RouterModule"]] }); })();


/***/ }),

/***/ "zUnb":
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _angular_platform_browser__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/platform-browser */ "jhN1");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _app_app_module__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./app/app.module */ "ZAI4");
/* harmony import */ var _environments_environment__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./environments/environment */ "AytR");




if (_environments_environment__WEBPACK_IMPORTED_MODULE_3__["environment"].production) {
    Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["enableProdMode"])();
}
_angular_platform_browser__WEBPACK_IMPORTED_MODULE_0__["platformBrowser"]().bootstrapModule(_app_app_module__WEBPACK_IMPORTED_MODULE_2__["AppModule"])
    .catch(err => console.error(err));


/***/ }),

/***/ "zn8P":
/*!******************************************************!*\
  !*** ./$$_lazy_route_resource lazy namespace object ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

function webpackEmptyAsyncContext(req) {
	// Here Promise.resolve().then() is used instead of new Promise() to prevent
	// uncaught exception popping up in devtools
	return Promise.resolve().then(function() {
		var e = new Error("Cannot find module '" + req + "'");
		e.code = 'MODULE_NOT_FOUND';
		throw e;
	});
}
webpackEmptyAsyncContext.keys = function() { return []; };
webpackEmptyAsyncContext.resolve = webpackEmptyAsyncContext;
module.exports = webpackEmptyAsyncContext;
webpackEmptyAsyncContext.id = "zn8P";

/***/ })

},[[0,"runtime","vendor"]]]);
//# sourceMappingURL=main.js.map