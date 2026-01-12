module.exports = {
  apps: [
    {
      name: 'reluxrent.com',
      script: './server.js',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
