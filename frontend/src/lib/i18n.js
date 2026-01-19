"use client";

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files directly
import enCommon from '../../public/locales/en/common.json';
import hiCommon from '../../public/locales/hi/common.json';
import mrCommon from '../../public/locales/mr/common.json';

const resources = {
    en: {
        common: enCommon
    },
    hi: {
        common: hiCommon
    },
    mr: {
        common: mrCommon
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: 'en', // default language
        fallbackLng: 'en',
        ns: ['common'],
        defaultNS: 'common',
        interpolation: {
            escapeValue: false, // react already safes from xss
        },
        react: {
            useSuspense: false // Handle loading states manually if needed
        }
    });

export default i18n;
