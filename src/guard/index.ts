const guardAsStringArray = (value: unknown): ReadonlyArray<string> => {
    if (!Array.isArray(value)) {
        throw new Error(`${value} is not an array`);
    }

    return value.map((element) => {
        if (typeof element === 'string') {
            return element;
        } else {
            throw new Error(`${element} is not string`);
        }
    });
};

const isNonNullable = <T>(t: T | null | undefined): t is T =>
    t !== null && t !== undefined;

export { isNonNullable, guardAsStringArray };
