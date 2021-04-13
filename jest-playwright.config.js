module.exports = {
  serverOptions: {
    command: 'npm run dev -- -p 3000',
    port: 3000,
    usedPortAction: 'ignore',
  },
  launchOptions: {
    headless: true,
    devtools: false,
    // slowMo: 250,
  },
};
