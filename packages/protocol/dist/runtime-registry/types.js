"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdapterRegistryEventType = exports.RuntimeAdapterBootstrapStatus = exports.RegisteredAdapterStatus = void 0;
exports.RegisteredAdapterStatus = {
    Registered: 'registered',
};
exports.RuntimeAdapterBootstrapStatus = {
    Ready: 'ready',
    Failed: 'failed',
};
exports.AdapterRegistryEventType = {
    AdapterRegistered: 'Adapter Registered',
    AdapterRemoved: 'Adapter Removed',
    AdapterValidation: 'Adapter Validation',
    AdapterMissing: 'Adapter Missing',
    RegistryReady: 'Registry Ready',
    RegistryFailed: 'Registry Failed',
};
