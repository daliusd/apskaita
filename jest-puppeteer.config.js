module.exports = {
  server: {
    command: 'npm run dev -- -p 4000',
    port: 4000,
  },
  launch: {
    headless: true,
    devtools: false,
  },
  browserContext: 'incognito',
};
