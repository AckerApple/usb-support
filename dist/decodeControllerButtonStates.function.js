"use strict";
exports.__esModule = true;
exports.decodeDeviceMetaState = void 0;
exports["default"] = decodeDeviceMetaState;
function decodeDeviceMetaState(metaState, event // 8 bits
) {
    var pressedButtons = [];
    if (!metaState.map || !event) {
        return pressedButtons;
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
        var alikes = Object.keys(changedMap)
            .filter(function (otherBtnName) {
            if (otherBtnName === buttonName) {
                return false;
            }
            if (changedMap[otherBtnName].pos !== current.pos) {
                return false;
            }
            return true;
        });
        // combined value match
        var match = findButtonCombo(alikes, current, { changedMap: changedMap, seekValue: seekValue });
        if (match) {
            return true;
        }
        return false;
    });
}
exports.decodeDeviceMetaState = decodeDeviceMetaState;
function findButtonCombo(alikes, current, _a) {
    var changedMap = _a.changedMap, seekValue = _a.seekValue, _b = _a.alreadytried, alreadytried = _b === void 0 ? [] : _b;
    if (!alikes.length) {
        return false;
    }
    var x = [current.value];
    alikes.forEach(function (name) {
        x.push(changedMap[name].value - current.idle);
    });
    var results = sumSets(x);
    return results.sums.includes(seekValue);
}
function getButtonMapByEvent(map, currentBits // 8
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
function sumSets(x) {
    var sums = [];
    var sets = [];
    function SubSets(read, queued) {
        if (read.length == 4 || (read.length <= 4 && queued.length == 0)) {
            if (read.length > 0) {
                var total = read.reduce(function (a, b) { return a + b; }, 0);
                if (sums.indexOf(total) == -1) {
                    sums.push(total);
                    sets.push(read.slice().sort());
                }
            }
        }
        else {
            SubSets(read.concat(queued[0]), queued.slice(1));
            SubSets(read, queued.slice(1));
        }
    }
    SubSets([], x);
    return { sums: sums, sets: sets };
}
//# sourceMappingURL=decodeControllerButtonStates.function.js.map