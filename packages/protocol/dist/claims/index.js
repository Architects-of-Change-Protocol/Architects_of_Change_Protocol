"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCanonicalStanding = exports.isValidCanonicalStanding = void 0;
__exportStar(require("./claim-enums"), exports);
__exportStar(require("./references"), exports);
__exportStar(require("./proofs"), exports);
__exportStar(require("./registries"), exports);
__exportStar(require("./credentials"), exports);
/**
 * SM-06: the runtime structural validator for `CanonicalStanding`. Exported as
 * a value (the rest of `./standing` is type-only) because a portability bundle
 * carries standing records across an external trust boundary and has to be able
 * to check them at runtime.
 */
var standing_1 = require("./standing");
Object.defineProperty(exports, "isValidCanonicalStanding", { enumerable: true, get: function () { return standing_1.isValidCanonicalStanding; } });
Object.defineProperty(exports, "validateCanonicalStanding", { enumerable: true, get: function () { return standing_1.validateCanonicalStanding; } });
__exportStar(require("./legacy-claims"), exports);
