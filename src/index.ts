import puppeteer from 'puppeteer';
import { isNonNullable } from './guard';
import { formQuery, waitFor } from './util';
import createBrowser from './browser';
import promptInput from './input';
import WordsUtil from './words';

const queries = () => {
    const parent = ['body', 'div.main.page'] as const;

    return {
        parent,
        selfTurnParent: [...parent, 'div.bottom', 'div.round', 'div.selfTurn'],
        syllable: formQuery([
            ...parent,
            'div.middle',
            'div.canvasArea',
            'div.round',
            'div.syllable',
        ]),
    } as const;
};

const setUserNameAndJoin = async <S extends string>({
    name,
    page,
}: Readonly<{
    name: S;
    page: puppeteer.Page;
}>) => {
    const parent = [
        'body',
        'div.pages',
        'div.setNickname.page',
        'form',
        'div.line',
    ];
    await page.waitForSelector(formQuery(parent));
    await waitFor(2);
    await page.type(formQuery(parent.concat('input')), name);
    await page.click(formQuery(parent.concat('button')));
};

const getIFrame = async ({
    page,
}: Readonly<{
    page: puppeteer.Page;
}>) => {
    await page.waitForSelector('iframe');
    const frame = await (await page.$('iframe'))?.contentFrame();
    if (frame) {
        return frame;
    }
    throw new Error('There is no iframe');
};

const ensureJoinable = async ({
    frame,
}: Readonly<{
    frame: puppeteer.Frame;
}>) => {
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const checkIsJoinable = await frame.$eval('.seating', (element) =>
            element.getAttribute('hidden')
        );
        if (!isNonNullable(checkIsJoinable)) {
            return await frame.click('.joinRound');
        }
    }
};

const ensureCanBeStarted = async ({
    frame,
}: Readonly<{
    frame: puppeteer.Frame;
}>) => {
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const status =
            (await frame.$eval('.status', (el) => el.textContent)) ?? '';
        if (!status.toLowerCase().includes('round will start in')) {
            continue;
        }
        const [coolDown] = status.match(/\d+/g) ?? [];
        if (isNonNullable(coolDown) && !parseInt(coolDown)) {
            return;
        }
    }
};

const enterWord = async ({
    word,
    page,
    frame,
    parent,
}: Readonly<{
    page: puppeteer.Page;
    frame: puppeteer.Frame;
    word: string | undefined;
    parent: ReadonlyArray<string>;
}>) => {
    if (word) {
        await frame.type(
            formQuery(parent.concat(['form', 'input.styled'])),
            word,
            {
                delay: 50,
            }
        );
        await page.keyboard.press('Enter');
    }
};

const produceConfig = async () => {
    const { port, name } = await promptInput();
    return {
        url: `https://jklm.fun/${port}`,
        user: {
            name,
        },
    } as const;
};

const main = async () => {
    const wordsUtil = WordsUtil.create();

    try {
        const config = await produceConfig();

        const page = await (await createBrowser()).newPage();

        await page.goto(config.url);

        await setUserNameAndJoin({
            page,
            name: config.user.name,
        });

        const frame = await getIFrame({
            page,
        });

        await waitFor(2);

        await ensureJoinable({
            frame,
        });

        await ensureCanBeStarted({
            frame,
        });

        const queriesUtil = queries();

        // eslint-disable-next-line no-constant-condition
        while (true) {
            await waitFor(0.5);
            if (
                await frame.$eval(
                    formQuery(queriesUtil.selfTurnParent),
                    (element) => element.getAttribute('hidden') === null
                )
            ) {
                const word = wordsUtil.getWordFromSyllable({
                    syllable:
                        (await frame.$eval(
                            queriesUtil.syllable,
                            (element) => element.textContent
                        )) ?? '',
                });
                await enterWord({
                    page,
                    word,
                    frame,
                    parent: queriesUtil.selfTurnParent,
                });
                wordsUtil.updateWords({
                    wordUsed: word,
                });
            }
        }
    } catch (error) {
        console.error(error);
    }
};

main();
