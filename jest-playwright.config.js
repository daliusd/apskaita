module.exports = {
  serverOptions: {
    command: 'PORT=3000 npm start',
    port: 3000,
    usedPortAction: 'ignore',
  },
  launchOptions: {
    headless: true,
    devtools: false,
    // slowMo: 250,
  },
};
