import {log} from "../utils/utils";
import lang from './lang.json';
import {typedConfig} from "../index";

interface LangData {
    [locale: string]: {
        [key: string]: string;
    };
}

const typedLang: LangData = lang as LangData;

function translate(key: string): string {
    if (typedLang[typedConfig.locale] && typedLang[typedConfig.locale][key]) {
        return typedLang[typedConfig.locale][key];
    }

    log(`Translation not found for key: ${typedConfig.locale} - ${key}`);

    return key;
}

export default translate;