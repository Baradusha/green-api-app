# Green API Test

Тестовое приложение для работы с Green API. Позволяет отправлять и получать сообщения WhatsApp.

Время выполнения проекта: 4 дня

## Инструкция по установке и запуску

1. Клонируйте репозиторий:

```bash
git clone [url репозитория]
cd green-api-app
```

2. Установите зависимости:

```bash
npm install
```

3. Запустите приложение:

```bash
npm run dev
```

## Использование

1. Получите учетные данные в личном кабинете [Green API](https://green-api.com/):

   - ID Instance
   - API Token Instance

2. Авторизуйтесь в приложении, используя полученные данные

3. Введите номер телефона получателя (в международном формате, без '+')

4. Отправляйте и получайте сообщения

## Требования к настройкам Green API

1. Инстанс должен быть авторизован (отсканируйте QR-код в личном кабинете)
2. Webhook URL должен быть отключен
3. Получение уведомлений о входящих сообщениях должно быть включено

## Технологии

- React
- TypeScript
- Material-UI
- Zustand
- Axios

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ["./tsconfig.node.json", "./tsconfig.app.json"],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from "eslint-plugin-react";

export default tseslint.config({
  // Set the react version
  settings: { react: { version: "18.3" } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs["jsx-runtime"].rules,
  },
});
```
