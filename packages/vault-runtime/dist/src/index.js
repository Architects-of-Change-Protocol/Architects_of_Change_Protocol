"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveNamespacePath = resolveNamespacePath;
function resolveNamespacePath(namespace) {
    return [namespace.organizationId, namespace.workspaceId, namespace.projectId, namespace.path]
        .filter(Boolean)
        .join(":");
}
