import {log} from "../utils/utils";
import lang from './lang.json';

interface LangData {
    [locale: string]: {
        [key: string]: string;
    };
}

const typedLang: LangData = lang as LangData;

function translate(locale: string, key: string): string {
    if (typedLang[locale] && typedLang[locale][key]) {
        return typedLang[locale][key];
    }

    log(`Translation not found for key: ${locale} - ${key}`);

    return key;
}

export default translate;
