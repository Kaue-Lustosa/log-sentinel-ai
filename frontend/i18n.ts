import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';

// Lista de idiomas suportados
const locales = ['en', 'pt-BR'];

export default getRequestConfig(async ({locale}) => {
  if (!locales.includes(locale as any)) {
    notFound();
  }

  return {
    locale: locale as string, 
    messages: (await import(`./messages/${locale}.json`)).default
  };
});