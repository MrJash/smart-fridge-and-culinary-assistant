export const environment = {
  production: false,
  geminiApiKey: typeof process !== 'undefined' && process.env['NG_APP_GEMINI_API_KEY']
    ? process.env['NG_APP_GEMINI_API_KEY']
    : ''
};
