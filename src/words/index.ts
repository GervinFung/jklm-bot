import englishWords from 'an-array-of-english-words';
import { guardAsStringArray } from '../guard';

export default class WordsUtil {
    private words: ReturnType<typeof guardAsStringArray>;

    static readonly create = () => new this();

    private constructor() {
        this.words = guardAsStringArray(englishWords);
    }

    readonly getWords = () => this.words;

    readonly updateWords = ({
        wordUsed,
    }: Readonly<{
        wordUsed: string | undefined;
    }>) =>
        (this.words =
            wordUsed === undefined
                ? this.words
                : this.words.filter((word) => word !== wordUsed));

    readonly getWordFromSyllable = ({
        syllable,
    }: Readonly<{
        syllable: string;
    }>) => {
        const wordsFound = !syllable.length
            ? []
            : this.words.filter(
                  (word) => word.length > 2 && word.includes(syllable)
              );
        return wordsFound[Math.floor(Math.random() * wordsFound.length)];
    };
}
