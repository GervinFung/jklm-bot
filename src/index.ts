import * as puppeteer from 'puppeteer';
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

const setUserNameAndJoin = async <S extends string>(
    params: Readonly<{
        name: S;
        page: puppeteer.Page;
    }>
) => {
    const parent = [
        'body',
        'div.pages',
        'div.setNickname.page',
        'form',
        'div.line',
    ];
    await params.page.waitForSelector(formQuery(parent));
    await waitFor(2);
    await params.page.type(formQuery(parent.concat('input')), params.name);
    await params.page.click(formQuery(parent.concat('button')));
};

const getIFrame = async (
    params: Readonly<{
        page: puppeteer.Page;
    }>
) => {
    await params.page.waitForSelector('iframe');
    const frame = await (await params.page.$('iframe'))?.contentFrame();
    if (frame) {
        return frame;
    }
    throw new Error('There is no iframe');
};

const ensureJoinable = async (
    params: Readonly<{
        frame: puppeteer.Frame;
    }>
) => {
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const checkIsJoinable = await params.frame.$eval(
            '.seating',
            (element) => element.getAttribute('hidden')
        );
        if (!isNonNullable(checkIsJoinable)) {
            return await params.frame.click('.joinRound');
        }
    }
};

const ensureCanBeStarted = async (
    params: Readonly<{
        frame: puppeteer.Frame;
    }>
) => {
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const status =
            (await params.frame.$eval(
                '.status',
                (element) => element.textContent
            )) ?? '';
        if (!status.toLowerCase().includes('round will start in')) {
            continue;
        }
        const [coolDown] = status.match(/\d+/g) ?? [];
        if (isNonNullable(coolDown) && !parseInt(coolDown)) {
            return;
        }
    }
};

const randomizeDelay = (
    params: Readonly<{
        charactersCount: number;
    }>
) => {
    const isLessThanFiveteen = params.charactersCount < 15;
    const boundConfig = {
        lower: isLessThanFiveteen ? 80 : 90,
        upper: isLessThanFiveteen ? 90 : 100,
    } as const;
    const delays = Array.from(
        {
            length: 5,
        },
        (_, index) =>
            (Math.random() % 2 ? boundConfig.lower : boundConfig.upper) + index
    );
    return delays[Math.floor(Math.random() * delays.length)];
};

const enterWord = async (
    params: Readonly<{
        page: puppeteer.Page;
        frame: puppeteer.Frame;
        word: string | undefined;
        parent: ReadonlyArray<string>;
    }>
) => {
    if (params.word) {
        const delay = randomizeDelay({
            charactersCount: params.word.length,
        });
        await params.frame.type(
            formQuery(params.parent.concat(['form', 'input.styled'])),
            params.word,
            !delay
                ? undefined
                : {
                      delay,
                  }
        );
        await params.page.keyboard.press('Enter');
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

        await waitFor(5);

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
            await waitFor(0.75);
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
