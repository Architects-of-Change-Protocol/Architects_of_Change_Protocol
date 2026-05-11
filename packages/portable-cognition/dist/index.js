"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePortablePackage = validatePortablePackage;
function validatePortablePackage(pkg) {
    const errors = [];
    if (!pkg.packageId)
        errors.push("missing_package_id");
    if (!pkg.sourceOrganizationId)
        errors.push("missing_source_organization_id");
    if (!pkg.topology.namespaces.length)
        errors.push("empty_topology");
    return { valid: errors.length === 0, errors };
}
