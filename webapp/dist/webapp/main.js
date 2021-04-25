(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["main"],{

/***/ "/GmE":
/*!*****************************!*\
  !*** ../shared/config.json ***!
  \*****************************/
/*! exports provided: socketPort, socketHost, default */
/***/ (function(module) {

module.exports = JSON.parse("{\"socketPort\":8081,\"socketHost\":\"0.0.0.0\"}");

/***/ }),

/***/ 0:
/*!***************************!*\
  !*** multi ./src/main.ts ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! /Users/ackerapple/projects/services/usb-controller-repl/webapp/src/main.ts */"zUnb");


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
/* harmony import */ var _shared_delayLog_function__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../shared/delayLog.function */ "stIS");
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
        Object(_shared_delayLog_function__WEBPACK_IMPORTED_MODULE_0__["default"])("\x1b[36mPush the " + key + " key\x1b[0m");
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

/***/ "K/im":
/*!**************************!*\
  !*** ../index.shared.ts ***!
  \**************************/
/*! exports provided: isDeviceController, devicesMatch, cleanseDeviceEvent, isDeviceEventsSame, eventsMatch, getControlConfigByDevice, savedControllerToConfigs */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isDeviceController", function() { return isDeviceController; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "devicesMatch", function() { return devicesMatch; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "cleanseDeviceEvent", function() { return cleanseDeviceEvent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isDeviceEventsSame", function() { return isDeviceEventsSame; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "eventsMatch", function() { return eventsMatch; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getControlConfigByDevice", function() { return getControlConfigByDevice; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "savedControllerToConfigs", function() { return savedControllerToConfigs; });
function isDeviceController(device) {
    return (device.usage === 5 && device.usagePage === 1)
        || (device.usage === 4 && device.usagePage === 1)
        || device.product.toLowerCase().indexOf("controller") >= 0
        || device.product.toLowerCase().indexOf("game") >= 0
        || device.product.toLowerCase().indexOf("joystick") >= 0;
}
function devicesMatch(device, lDevice) {
    return device === lDevice || device.productId === lDevice.productId && device.vendorId === lDevice.vendorId;
}
function cleanseDeviceEvent(device, event) {
    return event.map((number, index) => cleanseDeviceEventPos(device, number, index));
}
function cleanseDeviceEventPos(device, number, index) {
    return device.ignoreBits.includes(index) ? 0 : number;
}
function isDeviceEventsSame(device, event0, event1) {
    const castedEvent0 = cleanseDeviceEvent(device, event0);
    const castedEvent1 = cleanseDeviceEvent(device, event1);
    return eventsMatch(castedEvent0, castedEvent1);
}
function eventsMatch(event0, event1) {
    return event0.every((item, index) => item === event1[index]);
}
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


/***/ }),

/***/ "P+wG":
/*!**************************!*\
  !*** ../shared/enums.ts ***!
  \**************************/
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

/***/ "R2Xm":
/*!******************************!*\
  !*** ./src/app/app.utils.ts ***!
  \******************************/
/*! exports provided: testController, getDeviceLabel, download, copyText */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "testController", function() { return testController; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getDeviceLabel", function() { return getDeviceLabel; });
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
function getDeviceLabel(device) {
    var _a;
    let stringRef = ((_a = device.product) === null || _a === void 0 ? void 0 : _a.trim()) || '';
    if (device.manufacturer) {
        stringRef += ' by ' + device.manufacturer;
    }
    return stringRef;
}
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
/* harmony import */ var _shared_enums__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../shared/enums */ "P+wG");
/* harmony import */ var _mapController_function__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./mapController.function */ "0L1a");
/* harmony import */ var _shared_config_json__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../shared/config.json */ "/GmE");
var _shared_config_json__WEBPACK_IMPORTED_MODULE_2___namespace = /*#__PURE__*/__webpack_require__.t(/*! ../../../shared/config.json */ "/GmE", 1);
/* harmony import */ var _index_shared__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../index.shared */ "K/im");
/* harmony import */ var _decodeControllerButtonStates_function__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./decodeControllerButtonStates.function */ "ZGdl");
/* harmony import */ var ack_x_js_ack__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ack-x/js/ack */ "4/WS");
/* harmony import */ var ack_x_js_ack__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(ack_x_js_ack__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _app_utils__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./app.utils */ "R2Xm");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/common */ "ofXK");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @angular/router */ "tyNb");










function AppComponent_div_7_button_3_Template(rf, ctx) { if (rf & 1) {
    const _r13 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "button", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵlistener"]("click", function AppComponent_div_7_button_3_Template_button_click_0_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵrestoreView"](_r13); const item_r6 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"]().$implicit; return item_r6.idle = item_r6.lastEvent; });
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](1, "capture idle");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
} }
function AppComponent_div_7_button_4_Template(rf, ctx) { if (rf & 1) {
    const _r16 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "button", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵlistener"]("click", function AppComponent_div_7_button_4_Template_button_click_0_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵrestoreView"](_r16); const item_r6 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"]().$implicit; const ctx_r14 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"](); return ctx_r14.toggleDeviceRecord(item_r6); });
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](1, "record");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
} if (rf & 2) {
    const item_r6 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵclassProp"]("bg-warning", item_r6.recording);
} }
function AppComponent_div_7_div_6_Template(rf, ctx) { if (rf & 1) {
    const _r22 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "div", 19);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵlistener"]("click", function AppComponent_div_7_div_6_Template_div_click_0_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵrestoreView"](_r22); const index_r19 = ctx.index; const item_r6 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"]().$implicit; const ctx_r20 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"](); return ctx_r20.toggleIgnoreDeviceBit(item_r6, index_r19); });
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵpipe"](2, "slice");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
} if (rf & 2) {
    const value_r18 = ctx.$implicit;
    const index_r19 = ctx.index;
    const item_r6 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"]().$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵclassProp"]("bg-danger", item_r6.ignoreBits == null ? null : item_r6.ignoreBits.includes(index_r19));
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵpipeBind2"](2, 3, "000" + value_r18, -3));
} }
function AppComponent_div_7_ng_container_9_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](1, "button", 20);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementContainerEnd"]();
} if (rf & 2) {
    const button_r24 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("disabled", button_r24.value.pressed);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate"](button_r24.key);
} }
function AppComponent_div_7_Template(rf, ctx) { if (rf & 1) {
    const _r26 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "div", 13);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](1, "button", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵlistener"]("click", function AppComponent_div_7_Template_button_click_1_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵrestoreView"](_r26); const item_r6 = ctx.$implicit; const ctx_r25 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"](); return ctx_r25.saveController(item_r6); });
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](2, "save");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](3, AppComponent_div_7_button_3_Template, 2, 0, "button", 15);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](4, AppComponent_div_7_button_4_Template, 2, 2, "button", 16);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](5, "div", 17);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](6, AppComponent_div_7_div_6_Template, 3, 6, "div", 18);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](7, "div", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](8, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](9, AppComponent_div_7_ng_container_9_Template, 3, 2, "ng-container", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵpipe"](10, "keyvalue");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
} if (rf & 2) {
    const item_r6 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngIf", item_r6.lastEvent);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngIf", item_r6.idle);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngForOf", item_r6.lastEvent);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngForOf", _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵpipeBind1"](10, 4, item_r6.map));
} }
function AppComponent_div_16_Template(rf, ctx) { if (rf & 1) {
    const _r29 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](1, "button", 21);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵlistener"]("click", function AppComponent_div_16_Template_button_click_1_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵrestoreView"](_r29); const item_r27 = ctx.$implicit; const ctx_r28 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"](); return ctx_r28.listenToDevice(item_r27); });
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
} if (rf & 2) {
    const item_r27 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵstyleProp"]("background-color", item_r27.subscribed && "blue")("color", item_r27.subscribed && "white");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate1"](" listen to ", item_r27.product || item_r27.productId + ":" + item_r27.vendorId, " ");
} }
function AppComponent_div_21_Template(rf, ctx) { if (rf & 1) {
    const _r32 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](1, "button", 22);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵlistener"]("click", function AppComponent_div_21_Template_button_click_1_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵrestoreView"](_r32); const item_r30 = ctx.$implicit; const ctx_r31 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"](); return ctx_r31.listenToDevice(item_r30); });
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
} if (rf & 2) {
    const item_r30 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵstyleProp"]("background-color", item_r30.subscribed && "blue")("color", item_r30.subscribed && "white");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate1"](" ", item_r30.product || item_r30.productId + ":" + item_r30.vendorId, " ");
} }
function AppComponent_ng_container_26_div_1_Template(rf, ctx) { if (rf & 1) {
    const _r37 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](1, "button", 22);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵlistener"]("click", function AppComponent_ng_container_26_div_1_Template_button_click_1_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵrestoreView"](_r37); const item_r35 = ctx.$implicit; const ctx_r36 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"](2); return ctx_r36.savedController = item_r35.value; });
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
} if (rf & 2) {
    const item_r35 = ctx.$implicit;
    const ctx_r34 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵstyleProp"]("background-color", ctx_r34.savedController === item_r35.value && "blue" || null)("color", ctx_r34.savedController === item_r35.value && "white" || null);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate1"](" ", item_r35.value.meta.product || item_r35.value.meta.productId + ":" + item_r35.value.meta.vendorId, " ");
} }
function AppComponent_ng_container_26_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](1, AppComponent_ng_container_26_div_1_Template, 3, 5, "div", 8);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵpipe"](2, "keyvalue");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementContainerEnd"]();
} if (rf & 2) {
    const vendor_r33 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngForOf", _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵpipeBind1"](2, 1, vendor_r33.value));
} }
function AppComponent_div_28_Template(rf, ctx) { if (rf & 1) {
    const _r39 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "div", 9);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](1, "h3");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](3, "p");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](4, "Details of past connected and saved controllers");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](5, "textarea", 23);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵlistener"]("change", function AppComponent_div_28_Template_textarea_change_5_listener($event) { _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵrestoreView"](_r39); const ctx_r38 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"](); return ctx_r38.stringUpdateSavedController(ctx_r38.savedController, $event.target.value); });
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵpipe"](7, "json");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](8, "button", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵlistener"]("click", function AppComponent_div_28_Template_button_click_8_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵrestoreView"](_r39); const ctx_r40 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"](); return ctx_r40.saveControllers(); });
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](9, "save");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](10, "button", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵlistener"]("click", function AppComponent_div_28_Template_button_click_10_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵrestoreView"](_r39); const ctx_r41 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"](); return ctx_r41.downloadController(ctx_r41.savedController); });
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](11, "download");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](12, "button", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵlistener"]("click", function AppComponent_div_28_Template_button_click_12_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵrestoreView"](_r39); const ctx_r42 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"](); return ctx_r42.copyController(ctx_r42.savedController); });
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](13, "copy");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](14, "button", 14);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵlistener"]("click", function AppComponent_div_28_Template_button_click_14_listener() { _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵrestoreView"](_r39); const ctx_r43 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"](); return ctx_r43.confirmDeleteController(ctx_r43.savedController); });
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](15, "delete");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r4 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate1"]("Saved Controller: ", ctx_r4.savedController.meta.product || ctx_r4.savedController.meta.productId + ":" + ctx_r4.item.value.meta.vendorId, "");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵpipeBind1"](7, 2, ctx_r4.savedController));
} }
function AppComponent_div_41_p_3_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "p");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r44 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate"](ctx_r44.debug.lastLogs.error.message);
} }
function AppComponent_div_41_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "div", 24);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](1, "h3");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](2, "Recent error occurred");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](3, AppComponent_div_41_p_3_Template, 2, 1, "p", 25);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](4, "textarea", 26);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵpipe"](6, "json");
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
} if (rf & 2) {
    const ctx_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngIf", ctx_r5.debug.lastLogs.error.message);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵpipeBind1"](6, 2, ctx_r5.debug.lastLogs.error));
} }
const socketHost = window.location.hostname;
class AppComponent {
    constructor() {
        this.title = 'webapp';
        this.wsUrl = `ws://${socketHost}:${_shared_config_json__WEBPACK_IMPORTED_MODULE_2__["socketPort"]}`;
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
            this.connect();
            this.debug.state = 'constructed';
            this.log('web socket connected');
        }
        catch (err) {
            this.error(err, {
                message: 'Could not connect to web sockets',
            });
        }
    }
    connect() {
        if (this.reconnectInterval) {
            clearInterval(this.reconnectInterval);
            delete this.reconnectInterval;
        }
        this.connection = new WebSocket(this.wsUrl);
        this.connection.onopen = () => {
            this.log('web socket handshake successful');
            this.fetchUsbDevices();
            this.fetchSavedControllers();
            this.debug.state = 'socket opened';
            this.connection.onclose = () => {
                this.reconnectInterval = setInterval(() => {
                    this.log({ message: 'attempting ws reconnect...' });
                    this.connect();
                }, 3000);
            };
        };
        this.connection.onerror = (ev) => {
            this.error(ev, { message: `Socket error` });
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
                console.log('e.data', e);
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
        this.controllers = devices.filter(device => Object(_index_shared__WEBPACK_IMPORTED_MODULE_3__["isDeviceController"])(device));
        this.nonControllers = devices.filter(device => !Object(_index_shared__WEBPACK_IMPORTED_MODULE_3__["isDeviceController"])(device));
        this.log('controllers', this.controllers);
        this.log('other devices', this.nonControllers);
    }
    handleMessage(data) {
        switch (data.type) {
            case _shared_enums__WEBPACK_IMPORTED_MODULE_0__["SocketMessageType"].DEVICES:
                this.devicesUpdate(data.data);
                break;
            case _shared_enums__WEBPACK_IMPORTED_MODULE_0__["SocketMessageType"].SAVEDCONTROLLERS:
                if (data.data) {
                    this.savedControllers = data.data;
                    this.log('savedControllers', data.data);
                }
                break;
            case _shared_enums__WEBPACK_IMPORTED_MODULE_0__["SocketMessageType"].LISTENERS:
                this.onListeners(data.data);
                break;
            case _shared_enums__WEBPACK_IMPORTED_MODULE_0__["SocketMessageType"].DEVICEEVENT_CHANGE:
                this.onDeviceEventChange(data.data.event.data, data.data.device);
                break;
            case _shared_enums__WEBPACK_IMPORTED_MODULE_0__["SocketMessageType"].ERROR:
                this.error(data.data);
                break;
            default:
                this.warn('unknown event type', data.type);
        }
    }
    onListeners(devices) {
        this.log({ message: `listeners update received`, devices });
        this.listeners.length = devices.length;
        devices.forEach((device, index) => {
            this.listeners[index] = this.listeners[index] || {
                meta: device, subscribed: true, map: {}
            };
            const saved = this.getControlConfigByDevice(device);
            if (saved) {
                Object.assign(this.listeners[index], saved);
            }
            this.listeners[index].meta = device;
        });
        this.controllers.forEach(controller => {
            const find = this.listeners.find(lDevice => Object(_index_shared__WEBPACK_IMPORTED_MODULE_3__["devicesMatch"])(controller, lDevice.meta));
            if (find) {
                return controller.subscribed = true;
            }
            delete controller.subscribed;
        });
    }
    getControlConfigByDevice(device) {
        return Object(_index_shared__WEBPACK_IMPORTED_MODULE_3__["getControlConfigByDevice"])(this.savedControllers, device);
    }
    onDeviceEventChange(event, device) {
        const matchedListener = this.listeners.find(listener => Object(_index_shared__WEBPACK_IMPORTED_MODULE_3__["devicesMatch"])(listener.meta, device));
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
        return this.listeners.find(listener => Object(_index_shared__WEBPACK_IMPORTED_MODULE_3__["devicesMatch"])(listener.meta, device));
    }
    processDeviceUpdate(matchedListener) {
        const pressedKeyNames = Object(_decodeControllerButtonStates_function__WEBPACK_IMPORTED_MODULE_4__["default"])(matchedListener);
        matchedListener.pressed = pressedKeyNames;
        matchedListener.map = matchedListener.map || {};
        if (matchedListener.recording && !pressedKeyNames.length) {
            this.recordDeviceEvent(matchedListener);
        }
        // loop each known button and set its pressed property
        Object.entries(matchedListener.map).forEach(current => {
            const key = current[0];
            current[1].pressed = pressedKeyNames.includes(key);
        });
    }
    recordDeviceEvent(matchedListener) {
        const idleMap = matchedListener.idle;
        const pressedKeyNames = matchedListener.pressed;
        const isIdle = Object(_index_shared__WEBPACK_IMPORTED_MODULE_3__["eventsMatch"])(matchedListener.lastEvent, idleMap);
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
        if (!confirm(`confirm delete ${Object(_app_utils__WEBPACK_IMPORTED_MODULE_6__["getDeviceLabel"])(controller.meta)}`)) {
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
        const saveData = Object.assign({}, controller);
        delete saveData.lastEvent;
        delete saveData.subscribed;
        delete saveData.recording;
        delete saveData.pressed;
        products[productId] = saveData;
        this.saveControllers();
    }
    saveControllers() {
        this.wssSend(_shared_enums__WEBPACK_IMPORTED_MODULE_0__["SocketMessageType"].SAVECONTROLLERS, this.savedControllers);
    }
    addTestController() {
        this.controllers.push(_app_utils__WEBPACK_IMPORTED_MODULE_6__["testController"]);
        this.devices.push({
            map: {},
            subscribed: false,
            lastEvent: [],
            meta: _app_utils__WEBPACK_IMPORTED_MODULE_6__["testController"]
        });
    }
    fetchSavedControllers() {
        this.wssSend(_shared_enums__WEBPACK_IMPORTED_MODULE_0__["SocketMessageType"].GETSAVEDCONTROLLERS);
    }
    wssSend(type, data) {
        const payload = { type, data };
        this.debug.lastPayload = payload;
        this.connection.send(JSON.stringify(payload));
        return this;
    }
    fetchUsbDevices() {
        this.wssSend(_shared_enums__WEBPACK_IMPORTED_MODULE_0__["SocketMessageType"].REFRESH);
    }
    getSavedControllers() {
        this.wssSend(_shared_enums__WEBPACK_IMPORTED_MODULE_0__["SocketMessageType"].GETSAVEDCONTROLLERS);
    }
    listenToDevice(device) {
        console.log('device', device);
        const stringRef = Object(_app_utils__WEBPACK_IMPORTED_MODULE_6__["getDeviceLabel"])(device);
        this.log({
            message: `attempting to listen to ${stringRef}`, device
        });
        let type = _shared_enums__WEBPACK_IMPORTED_MODULE_0__["SocketMessageType"].LISTENTODEVICE;
        const deviceMatch = this.listeners.find(xDevice => Object(_index_shared__WEBPACK_IMPORTED_MODULE_3__["devicesMatch"])(device, xDevice.meta));
        if (deviceMatch) {
            type = _shared_enums__WEBPACK_IMPORTED_MODULE_0__["SocketMessageType"].UNSUBSCRIBEDEVICE;
            delete deviceMatch.subscribed;
            const controller = this.deviceToController(deviceMatch.meta);
            controller.subscribed = false;
            console.log('controller --- ', controller);
            this.log({
                message: `Unsubscribed from ${stringRef}`
            });
        }
        console.log('current', this.savedControllers);
        const savedControllers = Object.values(this.savedControllers).reduce((all, current) => [...all, ...Object.values(current)], []);
        const savedController = savedControllers.find(xSaved => Object(_index_shared__WEBPACK_IMPORTED_MODULE_3__["devicesMatch"])(device, xSaved.meta));
        if (savedController) {
            this.savedController = savedController;
        }
        this.log({
            message: `requesting web socket to listen to ${stringRef}`
        });
        this.wssSend(type, device);
        if (device === _app_utils__WEBPACK_IMPORTED_MODULE_6__["testController"]) {
            this.handleMessage({
                type: _shared_enums__WEBPACK_IMPORTED_MODULE_0__["SocketMessageType"].LISTENERS,
                data: {
                    devices: this.devices,
                    controllers: this.controllers,
                    event: { message: 'test-event' },
                    device
                }
            });
        }
    }
    deviceToController(device) {
        return this.controllers.find(control => Object(_index_shared__WEBPACK_IMPORTED_MODULE_3__["devicesMatch"])(device, control));
    }
    error(error, ...extra) {
        if (typeof error === 'string') {
            error = new Error(error);
        }
        const readable = ack_x_js_ack__WEBPACK_IMPORTED_MODULE_5__["ack"].error(error).toObject();
        this.debug.lastLogs.error = Object.assign(Object.assign(Object.assign({}, readable), error), extra.reduce((all, one) => (Object.assign(Object.assign({}, all), one)), {}));
        console.log('lastLogs.error updated');
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
    stringUpdateSavedController(controller, newData) {
        this.savedController = JSON.parse(newData);
        this.saveController(this.savedController);
    }
    toggleIgnoreDeviceBit(item, index) {
        item.ignoreBits = item.ignoreBits || [];
        const ignoreIndex = item.ignoreBits.indexOf(index);
        if (ignoreIndex === -1) {
            return item.ignoreBits.push(index);
        }
        item.ignoreBits.splice(ignoreIndex, 1);
    }
    downloadController(controller) {
        const filename = Object(_app_utils__WEBPACK_IMPORTED_MODULE_6__["getDeviceLabel"])(controller.meta) + '.json';
        const data = JSON.stringify(controller, null, 2);
        Object(_app_utils__WEBPACK_IMPORTED_MODULE_6__["download"])(filename, data);
    }
    copyController(controller) {
        Object(_app_utils__WEBPACK_IMPORTED_MODULE_6__["copyText"])(JSON.stringify(controller, null, 2));
    }
}
AppComponent.ɵfac = function AppComponent_Factory(t) { return new (t || AppComponent)(); };
AppComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵdefineComponent"]({ type: AppComponent, selectors: [["app-root"]], decls: 49, vars: 25, consts: [[1, "child-pad-xs", "child-margin-xs", 2, "display", "flex", "flex-wrap", "wrap"], [1, "flex2", "border", "border-radius-10"], ["wrap", "off", 1, "code"], ["class", "flex-wrap flex-valign-center", 4, "ngFor", "ngForOf"], [1, "flex-1", "border", "border-radius-10"], ["type", "button", 3, "click"], [1, "flex-wrap"], [2, "display", "flex", "flex-wrap", "wrap"], [4, "ngFor", "ngForOf"], [1, "flex1", "border", "border-radius-10"], ["class", "flex1 border border-radius-10", 4, "ngIf"], [1, "flex1", "flex-wrap", "border", "border-radius-10"], ["class", "flex2 border border-radius-10 bg-warning", 4, "ngIf"], [1, "flex-wrap", "flex-valign-center"], [3, "click"], [3, "click", 4, "ngIf"], [3, "bg-warning", "click", 4, "ngIf"], [1, "flex"], ["class", "border radius-5 cursor-pointer", "style", "margin:.3em;padding:.5em;", 3, "bg-danger", "click", 4, "ngFor", "ngForOf"], [1, "border", "radius-5", "cursor-pointer", 2, "margin", ".3em", "padding", ".5em", 3, "click"], ["type", "button", 3, "disabled"], ["type", "button", 2, "margin", ".5em", "font-size", "1.1em", "padding", ".4em", 3, "click"], ["type", "button", 2, "margin", ".5em", 3, "click"], ["wrap", "off", 1, "code", 3, "change"], [1, "flex2", "border", "border-radius-10", "bg-warning"], [4, "ngIf"], [1, "code"]], template: function AppComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](0, "div", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](1, "div", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](2, "h3");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](4, "textarea", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](5);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵpipe"](6, "json");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](7, AppComponent_div_7_Template, 11, 6, "div", 3);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](8, "div", 4);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](9, "h3");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](10, "Controllers");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](11, "p");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](12, "button", 5);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵlistener"]("click", function AppComponent_Template_button_click_12_listener() { return ctx.addTestController(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](13, "add test controller");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](14, "div", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](15, "div", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](16, AppComponent_div_16_Template, 3, 5, "div", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](17, "div", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](18, "h4");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](19, "Other Devices");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](20, "div", 6);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](21, AppComponent_div_21_Template, 3, 5, "div", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](22, "div", 9);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](23, "h4");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](24, "Saved Controllers");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](25, "div", 7);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](26, AppComponent_ng_container_26_Template, 3, 3, "ng-container", 8);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵpipe"](27, "keyvalue");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](28, AppComponent_div_28_Template, 16, 4, "div", 10);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](29, "div", 11);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](30, "h3");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](31);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](32, "textarea", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](33);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵpipe"](34, "json");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](35, "div", 11);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](36, "h3");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](37);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](38, "textarea", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](39);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵpipe"](40, "json");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtemplate"](41, AppComponent_div_41_Template, 7, 4, "div", 12);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](42, "div", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](43, "h3");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](44, "debug");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementStart"](45, "textarea", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtext"](46);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵpipe"](47, "json");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵelement"](48, "router-outlet");
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate1"]("Listeners: ", ctx.listeners.length, "");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵstyleProp"]("height", 25 * ctx.listeners.length, "em");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](1);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate1"]("      ", _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵpipeBind1"](6, 15, ctx.listeners), "\n    ");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngForOf", ctx.listeners);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](9);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngForOf", ctx.controllers);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](5);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngForOf", ctx.nonControllers);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](5);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngForOf", _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵpipeBind1"](27, 17, ctx.savedControllers));
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngIf", ctx.savedController);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](3);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate1"]("Devices: ", ctx.devices.length, "");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵpipeBind1"](34, 19, ctx.devices));
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate1"]("Controllers: ", ctx.controllers.length, "");
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵpipeBind1"](40, 21, ctx.controllers));
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵproperty"]("ngIf", ctx.debug.lastLogs.error);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵadvance"](5);
        _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵtextInterpolate1"]("      ", _angular_core__WEBPACK_IMPORTED_MODULE_7__["ɵɵpipeBind1"](47, 23, ctx.debug), "\n    ");
    } }, directives: [_angular_common__WEBPACK_IMPORTED_MODULE_8__["NgForOf"], _angular_common__WEBPACK_IMPORTED_MODULE_8__["NgIf"], _angular_router__WEBPACK_IMPORTED_MODULE_9__["RouterOutlet"]], pipes: [_angular_common__WEBPACK_IMPORTED_MODULE_8__["JsonPipe"], _angular_common__WEBPACK_IMPORTED_MODULE_8__["KeyValuePipe"], _angular_common__WEBPACK_IMPORTED_MODULE_8__["SlicePipe"]], styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJhcHAuY29tcG9uZW50LnNjc3MifQ== */", "textarea.code[_ngcontent-%COMP%] {\n    height:500px;width:100%;\n    min-width:300px;\n  }"] });


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

/***/ "ZGdl":
/*!**********************************************************!*\
  !*** ./src/app/decodeControllerButtonStates.function.ts ***!
  \**********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return decodeDeviceMetaState; });
function decodeDeviceMetaState(metaState) {
    const pressedButtons = [];
    if (!metaState.map || !metaState.lastEvent) {
        return pressedButtons;
    }
    const changedMap = getButtonMapByEvent(metaState.map, metaState.lastEvent);
    return Object.keys(changedMap).filter((buttonName) => {
        const current = changedMap[buttonName];
        const currentPos = current.pos;
        const stateValue = metaState.lastEvent[currentPos];
        // direct value match
        if (current.value === stateValue) {
            return true;
        }
        else {
            const currentValue = current.value - current.idle;
            // combined value match
            const match = Object.keys(changedMap).find((otherBtnName) => {
                if (otherBtnName === buttonName) {
                    return false;
                }
                const compareMeta = changedMap[otherBtnName];
                if (compareMeta.pos !== current.pos) {
                    return false;
                }
                const compareValue = compareMeta.value - compareMeta.idle;
                const testValue = current.idle + compareValue + currentValue; //15 + 16 + 16 === 47
                if (testValue === stateValue) {
                    return true;
                }
            });
            if (match) {
                return true;
            }
        }
        return false;
    });
}
function getButtonMapByEvent(map, currentBits) {
    return currentBits.reduce((all, current, index) => {
        Object.keys(map)
            .filter((buttonName) => map[buttonName].pos === index && map[buttonName].idle !== current)
            .forEach(buttonName => all[buttonName] = map[buttonName]);
        return all;
    }, {});
}


/***/ }),

/***/ "stIS":
/*!**************************************!*\
  !*** ../shared/delayLog.function.ts ***!
  \**************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return delayLog; });
function delayLog(...args) {
    setTimeout(() => console.log(...args), 300);
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