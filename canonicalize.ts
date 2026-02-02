export function canonicalizeJSON(value: any): string {
  if (value === null) {
    return 'null';
  }

  const valueType = typeof value;

  if (valueType === 'string') {
    return JSON.stringify(value);
  }

  if (valueType === 'number') {
    if (!Number.isFinite(value)) {
      throw new Error('Non-finite numbers are not supported in canonical JSON');
    }

    if (Number.isInteger(value)) {
      return value.toString();
    }

    let numberString = value.toString();
    if (numberString.includes('.')) {
      numberString = numberString.replace(/0+$/, '');
      if (numberString.endsWith('.')) {
        numberString = numberString.slice(0, -1);
      }
    }

    return numberString;
  }

  if (valueType === 'boolean') {
    return value ? 'true' : 'false';
  }

  if (Array.isArray(value)) {
    const items = value.map((item) => canonicalizeJSON(item));
    return `[${items.join(',')}]`;
  }

  if (valueType === 'object') {
    const keys = Object.keys(value).sort();
    const pairs = keys.map((key) => {
      const keyString = JSON.stringify(key);
      const valueString = canonicalizeJSON(value[key]);
      return `${keyString}:${valueString}`;
    });
    return `{${pairs.join(',')}}`;
  }

  throw new Error(`Unsupported type in canonical JSON: ${valueType}`);
}
