const formQuery = (elements: ReadonlyArray<string>) => elements.join(' > ');

const waitFor = (seconds: number) =>
    new Promise<'done'>((resolve) =>
        setTimeout(() => resolve('done'), seconds * 1000)
    );

export { formQuery, waitFor };
