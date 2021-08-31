"use strict";
exports.__esModule = true;
var decodeControllerButtonStates_function_1 = require("./decodeControllerButtonStates.function");
var json = require("../test/eg-starts.DeviceProductLayout.json");
describe('decodeControllerButtonStates.function.spec.ts', function () {
    var testJson;
    var map;
    var entries;
    beforeEach(function () {
        testJson = JSON.parse(JSON.stringify(json)); // deep clone
        map = testJson.map;
        entries = Object.entries(map);
    });
    describe('#decodeDeviceMetaState', function () {
        it('no buttons pressed', function () {
            var values = testJson.idle;
            var result = decodeControllerButtonStates_function_1["default"](testJson, values);
            expect(result).toBeDefined();
            expect(result.length).toBe(0);
        });
        it('1 button pressed', function () {
            var values = testJson.idle;
            values[entries[0][1].pos] = entries[0][1].value + entries[0][1].idle;
            var result = decodeControllerButtonStates_function_1["default"](testJson, values);
            expect(result).toBeDefined();
            expect(result.length).toBe(1);
            expect(result).toContain(entries[0][0]);
        });
        describe('#findButtonCombo', function () {
            it('1 button true', function () {
                var alikes = decodeControllerButtonStates_function_1.getSamePosButtons('letterC', testJson.map);
                var result = decodeControllerButtonStates_function_1.findButtonCombo(alikes, testJson.map.letterC, {
                    changedMap: testJson.map,
                    seekValue: entries[0][1].idle + entries[0][1].value
                });
                expect(result).toBe(true);
            });
            it('1 button false', function () {
                var alikes = decodeControllerButtonStates_function_1.getSamePosButtons('letterC', testJson.map);
                var result = decodeControllerButtonStates_function_1.findButtonCombo(alikes, testJson.map.letterC, {
                    changedMap: testJson.map,
                    seekValue: entries[0][1].idle + entries[1][1].value
                });
                expect(result).toBe(false);
            });
            it('2 buttons true', function () {
                var alikes = decodeControllerButtonStates_function_1.getSamePosButtons('letterC', testJson.map);
                var result = decodeControllerButtonStates_function_1.findButtonCombo(alikes, testJson.map.letterC, {
                    changedMap: testJson.map,
                    seekValue: entries[0][1].idle + entries[0][1].value + entries[1][1].value
                });
                expect(result).toBe(true);
            });
            it('2 buttons true - 1 false', function () {
                var alikes = decodeControllerButtonStates_function_1.getSamePosButtons('leftFlipper', testJson.map);
                var result = decodeControllerButtonStates_function_1.findButtonCombo(alikes, testJson.map.letterC, {
                    changedMap: testJson.map,
                    seekValue: entries[0][1].idle + entries[0][1].value + entries[1][1].value
                });
                expect(result).toBe(false);
            });
            it('buttons false', function () {
                var alikes = decodeControllerButtonStates_function_1.getSamePosButtons('letterC', testJson.map);
                var result = decodeControllerButtonStates_function_1.findButtonCombo(alikes, testJson.map.letterC, {
                    changedMap: testJson.map,
                    seekValue: entries[0][1].idle
                });
                expect(result).toBe(false);
            });
        });
        it('2 buttons pressed', function () {
            var values = testJson.idle;
            expect(entries[0][1].pos).toBe(entries[1][1].pos);
            var value = entries[0][1].idle + entries[0][1].value + entries[1][1].value;
            values[entries[0][1].pos] = value;
            var result = decodeControllerButtonStates_function_1["default"](testJson, values);
            expect(result).toBeDefined();
            expect(result.length).toBe(2);
            expect(result).toContain(entries[0][0]);
            expect(result).toContain(entries[1][0]);
        });
    });
    it('#getSamePosButtons', function () {
        var result = decodeControllerButtonStates_function_1.getSamePosButtons('letterC', {
            letterC: {
                pos: 6,
                value: 16,
                idle: 0,
                updatedAt: 1628363581162
            },
            letterB: {
                pos: 6,
                value: 8,
                idle: 0,
                updatedAt: 1627154826288
            },
            leftFlipper: {
                pos: 0,
                value: 0,
                idle: 127,
                updatedAt: 1619387577120
            }
        });
        expect(result).toBeDefined();
        expect(result.length).toBe(1);
        expect(result[0]).toBe('letterB');
    });
});
//# sourceMappingURL=decodeControllerButtonStates.function.spec.js.map