"use strict";
exports.__esModule = true;
exports.decodeDeviceMetaState = void 0;
exports["default"] = decodeDeviceMetaState;
function decodeDeviceMetaState(metaState, event) {
    var pressedButtons = [];
    if (!metaState.map || !event) {
        return pressedButtons;
    }
    var changedMap = getButtonMapByEvent(metaState.map, event);
    return Object.keys(changedMap).filter(function (buttonName) {
        var current = changedMap[buttonName];
        var currentPos = current.pos;
        var stateValue = event[currentPos];
        // direct value match
        if (current.value === stateValue) {
            return true;
        }
        else {
            var currentValue_1 = current.value - current.idle;
            // combined value match
            var match = Object.keys(changedMap).find(function (otherBtnName) {
                if (otherBtnName === buttonName) {
                    return false;
                }
                var compareMeta = changedMap[otherBtnName];
                if (compareMeta.pos !== current.pos) {
                    return false;
                }
                var compareValue = compareMeta.value - compareMeta.idle;
                var testValue = current.idle + compareValue + currentValue_1; //15 + 16 + 16 === 47
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
exports.decodeDeviceMetaState = decodeDeviceMetaState;
function getButtonMapByEvent(map, currentBits) {
    return currentBits.reduce(function (all, current, index) {
        Object.keys(map)
            .filter(function (buttonName) {
            return map[buttonName].pos === index && map[buttonName].idle !== current;
        })
            .forEach(function (buttonName) { return all[buttonName] = map[buttonName]; });
        return all;
    }, {});
}
//# sourceMappingURL=decodeControllerButtonStates.function.js.map