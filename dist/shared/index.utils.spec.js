"use strict";
exports.__esModule = true;
var index_utils_1 = require("./index.utils");
describe('index.utils.ts', function () {
    describe('#sumSets', function () {
        it('3', function () {
            var results = index_utils_1.sumSets([1, 2]);
            expect(results).toBeDefined();
            expect(results.sums).toBeDefined();
            expect(results.sets).toBeDefined();
            expect(results.sums.length).toBe(3);
            expect(results.sets.length).toBe(3);
            expect(results.sums).toContain(3);
            expect(results.sums).toContain(1);
            expect(results.sums).toContain(2);
        });
        it('4', function () {
            var results = index_utils_1.sumSets([1, 2, 3, 4]);
            expect(results).toBeDefined();
            expect(results.sums).toBeDefined();
            expect(results.sets).toBeDefined();
            expect(results.sums.length).toBe(10);
            expect(results.sets.length).toBe(10);
        });
    });
});
//# sourceMappingURL=index.utils.spec.js.map