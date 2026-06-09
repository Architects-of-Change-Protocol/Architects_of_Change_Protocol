export class ConsentParseError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ConsentParseError';
    }
}
export class ConsentValidationError extends Error {
    errors;
    constructor(message, errors) {
        super(message);
        this.name = 'ConsentValidationError';
        this.errors = errors;
    }
}
