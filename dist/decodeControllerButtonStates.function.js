"use strict";
exports.__esModule = true;
exports.findButtonCombo = exports.getSamePosButtons = exports.decodeDeviceMetaState = void 0;
var index_utils_1 = require("./index.utils");
exports["default"] = decodeDeviceMetaState;
/** runtime decode button presses
 * - Todo: More performance using a map of all possible presses instead of using this
*/
function decodeDeviceMetaState(metaState, event // 8 bits
) {
    if (!metaState.map || !event) {
        return [];
    }
    var changedMap = getButtonMapByEvent(metaState.map, event);
    return Object.keys(changedMap).filter(function (buttonName) {
        var current = changedMap[buttonName];
        var currentPos = current.pos;
        var seekValue = event[currentPos];
        // does another matching position have an exact match?
        var otherHasExact = Object.values(changedMap)
            .find(function (btnMap) { return btnMap.pos === currentPos && btnMap !== current && btnMap.value === seekValue; });
        if (otherHasExact) {
            return false;
        }
        // direct value match
        if (current.value === seekValue) {
            return true;
        }
        // items on the same pos
        var alikes = getSamePosButtons(buttonName, changedMap);
        // combined value match
        var match = findButtonCombo(alikes, current, { changedMap: changedMap, seekValue: seekValue });
        if (match) {
            return true;
        }
        return false;
    });
}
exports.decodeDeviceMetaState = decodeDeviceMetaState;
function getSamePosButtons(buttonName, changedMap) {
    return Object.keys(changedMap)
        .filter(function (otherBtnName) {
        if (otherBtnName === buttonName) {
            return false;
        }
        if (changedMap[otherBtnName].pos !== changedMap[buttonName].pos) {
            return false;
        }
        return true;
    });
}
exports.getSamePosButtons = getSamePosButtons;
/** determines if multiple button pressed  */
function findButtonCombo(alikes, // two or more button names
current, _a) {
    var changedMap = _a.changedMap, seekValue = _a.seekValue;
    if (!alikes.length) {
        return false;
    }
    var x = [current];
    alikes.forEach(function (name) {
        x.push(changedMap[name]);
    });
    var results = (0, index_utils_1.sumSets)(x, function (b) {
        return b.reduce(function (a, b) { return a + b.value - current.idle; }, 0);
    }); // get every possible combination
    return results.sets.find(function (items, index) {
        // remove all singular possible combinations
        if (items.length === 1) {
            var isTheCurrentOne = items[0].value === current.value || items[0].value === current.value + current.idle;
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
exports.findButtonCombo = findButtonCombo;
function getButtonMapByEvent(map, currentBits // length === 8
) {
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