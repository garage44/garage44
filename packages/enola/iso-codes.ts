/**
 * ISO 639-2 to ISO 639-1 language code mapping
 *
 * ISO 639-2 uses three-letter codes and has two forms:
 * - Terminological (T): Based on the native name of the language
 * - Bibliographic (B): Alternative codes used in bibliographic tradition
 *
 * We use only the terminological (T) codes where available, as they are:
 * 1. Based on the native names of the languages (endonyms)
 * 2. Preferred in modern applications
 * 3. Recommended by ISO 639-2 Registration Authority
 *
 * Example:
 * German: 'deu' (terminological, from "Deutsch") maps to 'de' (ISO 639-1)
 */
const ISO_639_2_TO_1: Record<string, string> = {
    aar: 'aa', // Afar
    abk: 'ab', // Abkhazian
    afr: 'af', // Afrikaans
    aka: 'ak', // Akan
    amh: 'am', // Amharic
    ara: 'ar', // Arabic
    arg: 'an', // Aragonese
    asm: 'as', // Assamese
    ava: 'av', // Avaric
    ave: 'ae', // Avestan
    aym: 'ay', // Aymara
    aze: 'az', // Azerbaijani
    bam: 'bm', // Bambara
    bel: 'be', // Belarusian
    ben: 'bn', // Bengali
    bih: 'bh', // Bihari languages
    bis: 'bi', // Bislama
    bod: 'bo', // Tibetan
    bos: 'bs', // Bosnian
    bre: 'br', // Breton
    bul: 'bg', // Bulgarian
    cat: 'ca', // Catalan
    ces: 'cs', // Czech
    cha: 'ch', // Chamorro
    che: 'ce', // Chechen
    chu: 'cu', // Church Slavic
    chv: 'cv', // Chuvash
    cor: 'kw', // Cornish
    cos: 'co', // Corsican
    cre: 'cr', // Cree
    cym: 'cy', // Welsh
    dan: 'da', // Danish
    deu: 'de', // German
    div: 'dv', // Divehi
    dzo: 'dz', // Dzongkha
    ell: 'el', // Greek
    eng: 'en', // English
    epo: 'eo', // Esperanto
    est: 'et', // Estonian
    eus: 'eu', // Basque
    ewe: 'ee', // Ewe
    fao: 'fo', // Faroese
    fas: 'fa', // Persian
    fij: 'fj', // Fijian
    fin: 'fi', // Finnish
    fra: 'fr', // French
    ful: 'ff', // Fulah
    gla: 'gd', // Gaelic
    gle: 'ga', // Irish
    glg: 'gl', // Galician
    glv: 'gv', // Manx
    grn: 'gn', // Guarani
    guj: 'gu', // Gujarati
    hat: 'ht', // Haitian
    hau: 'ha', // Hausa
    heb: 'he', // Hebrew
    her: 'hz', // Herero
    hin: 'hi', // Hindi
    hmo: 'ho', // Hiri Motu
    hun: 'hu', // Hungarian
    hye: 'hy', // Armenian
    ido: 'io', // Ido
    iii: 'ii', // Sichuan Yi
    iku: 'iu', // Inuktitut
    ile: 'ie', // Interlingue
    ina: 'ia', // Interlingua
    ind: 'id', // Indonesian
    ipk: 'ik', // Inupiaq
    isl: 'is', // Icelandic
    ita: 'it', // Italian
    jav: 'jv', // Javanese
    jpn: 'ja', // Japanese
    kal: 'kl', // Kalaallisut
    kan: 'kn', // Kannada
    kas: 'ks', // Kashmiri
    kat: 'ka', // Georgian
    kau: 'kr', // Kanuri
    kaz: 'kk', // Kazakh
    khm: 'km', // Central Khmer
    kik: 'ki', // Kikuyu
    kin: 'rw', // Kinyarwanda
    kir: 'ky', // Kirghiz
    kom: 'kv', // Komi
    kon: 'kg', // Kongo
    kor: 'ko', // Korean
    kua: 'kj', // Kuanyama
    kur: 'ku', // Kurdish
    lao: 'lo', // Lao
    lat: 'la', // Latin
    lav: 'lv', // Latvian
    lim: 'li', // Limburgan
    lin: 'ln', // Lingala
    lit: 'lt', // Lithuanian
    lub: 'lu', // Luba-Katanga
    lug: 'lg', // Ganda
    mah: 'mh', // Marshallese
    mal: 'ml', // Malayalam
    mar: 'mr', // Marathi
    mkd: 'mk', // Macedonian
    mlg: 'mg', // Malagasy
    mlt: 'mt', // Maltese
    mon: 'mn', // Mongolian
    mri: 'mi', // Maori
    msa: 'ms', // Malay
    mya: 'my', // Burmese
    nau: 'na', // Nauru
    nav: 'nv', // Navajo
    nbl: 'nr', // South Ndebele
    nde: 'nd', // North Ndebele
    ndo: 'ng', // Ndonga
    nep: 'ne', // Nepali
    nld: 'nl', // Dutch
    nno: 'nn', // Norwegian Nynorsk
    nob: 'nb', // Norwegian Bokmål
    nor: 'no', // Norwegian
    nya: 'ny', // Chichewa
    oci: 'oc', // Occitan
    oji: 'oj', // Ojibwa
    ori: 'or', // Oriya
    orm: 'om', // Oromo
    oss: 'os', // Ossetian
    pan: 'pa', // Panjabi
    pli: 'pi', // Pali
    pol: 'pl', // Polish
    por: 'pt', // Portuguese
    pus: 'ps', // Pushto
    que: 'qu', // Quechua
    roh: 'rm', // Romansh
    ron: 'ro', // Romanian
    run: 'rn', // Rundi
    rus: 'ru', // Russian
    sag: 'sg', // Sango
    san: 'sa', // Sanskrit
    sin: 'si', // Sinhala
    slk: 'sk', // Slovak
    slv: 'sl', // Slovenian
    sme: 'se', // Northern Sami
    smo: 'sm', // Samoan
    sna: 'sn', // Shona
    snd: 'sd', // Sindhi
    som: 'so', // Somali
    sot: 'st', // Southern Sotho
    spa: 'es', // Spanish
    sqi: 'sq', // Albanian
    srd: 'sc', // Sardinian
    srp: 'sr', // Serbian
    ssw: 'ss', // Swati
    sun: 'su', // Sundanese
    swa: 'sw', // Swahili
    swe: 'sv', // Swedish
    tah: 'ty', // Tahitian
    tam: 'ta', // Tamil
    tat: 'tt', // Tatar
    tel: 'te', // Telugu
    tgk: 'tg', // Tajik
    tgl: 'tl', // Tagalog
    tha: 'th', // Thai
    tir: 'ti', // Tigrinya
    ton: 'to', // Tonga
    tsn: 'tn', // Tswana
    tso: 'ts', // Tsonga
    tuk: 'tk', // Turkmen
    tur: 'tr', // Turkish
    twi: 'tw', // Twi
    uig: 'ug', // Uighur
    ukr: 'uk', // Ukrainian
    urd: 'ur', // Urdu
    uzb: 'uz', // Uzbek
    ven: 've', // Venda
    vie: 'vi', // Vietnamese
    vol: 'vo', // Volapük
    wln: 'wa', // Walloon
    wol: 'wo', // Wolof
    xho: 'xh', // Xhosa
    yid: 'yi', // Yiddish
    yor: 'yo', // Yoruba
    zha: 'za', // Zhuang
    zho: 'zh', // Chinese
    zul: 'zu', // Zulu
}

/**
 * Convert ISO 639-1 code to ISO 639-2 code
 * Returns the terminological (T) code where available
 * @param iso6391Code - Two-letter ISO 639-1 language code
 * @returns Three-letter ISO 639-2 language code or null if not found
 */
function iso6391ToIso6392(iso6391Code: string): string | null {
    const code = iso6391Code.toLowerCase()

    return null
}

/**
 * Extended language codes mapping for variants
 * Maps from provider-specific codes to ISO language codes
 */
const EXTENDED_LANGUAGE_CODES = {
    'en-gb': 'eng-gbr', // British English
    'en-us': 'eng-usa', // American English
    'pt-br': 'por-bra', // Brazilian Portuguese
    'pt-pt': 'por-prt', // European Portuguese
    zh: 'zho', // Chinese (macrolanguage)
    'zh-hans': 'zho-hans', // Simplified Chinese (Han Simplified)
}

function toIso6391(iso6392Code: string): string | null {
    const code = iso6392Code.toLowerCase()
    if (code.includes('-')) {
        // For codes like 'eng-gbr', convert to 'en-gb'
        for (const [iso6391, iso6392] of Object.entries(EXTENDED_LANGUAGE_CODES)) {
            if (iso6392 === code) {
                return iso6391
            }
        }
    }
    return ISO_639_2_TO_1[code] || null
}

/**
 * Convert extended language code to ISO 639-2
 * Handles variants like en-US, pt-BR, etc.
 * @param code - Extended language code (e.g., 'en-US', 'pt-BR')
 * @returns The ISO 639-2 code with optional region (e.g., 'eng-GBR', 'por-BRA')
 */
function toIso6392(iso6391Code: string): string | null {
    const code = iso6391Code.toLowerCase()
    if (iso6391Code.includes('-')) {
        const extendedCode = EXTENDED_LANGUAGE_CODES[iso6391Code.toLowerCase()]

        if (extendedCode) {
            return extendedCode
        }
    }

    for (const [iso6392, iso6391] of Object.entries(ISO_639_2_TO_1)) {
        if (iso6391 === code) {
            return iso6392
        }
    }

    return null
}

/**
 * Get the region code from an ISO 639-2 code with region
 * @param code - ISO 639-2 code with optional region (e.g., 'eng-GB', 'por-BR')
 * @returns The region code or null if not found
 */
function getRegionCode(code: string): string | null {
    const parts = code.split('-')
    return parts.length > 1 ? parts[1] : null
}

export {
    EXTENDED_LANGUAGE_CODES,
    ISO_639_2_TO_1,
    getRegionCode,
    iso6391ToIso6392,
    toIso6391,
    toIso6392,
}