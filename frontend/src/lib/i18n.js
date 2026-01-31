"use client";

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';


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
        lng: 'en', 
        fallbackLng: 'en',
        ns: ['common'],
        defaultNS: 'common',
        interpolation: {
            escapeValue: false, 
        },
        react: {
            useSuspense: false 
        }
    });

export default i18n;
