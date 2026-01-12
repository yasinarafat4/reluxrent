// helpers/socialLogin.js
const axios = require('axios');
const appleSignin = require('apple-signin-auth');

async function verifySocialLogin(provider, token) {
  switch (provider) {
    case 'google': {
      if (!token) throw new Error('Google idToken required');
      const res = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
      const { email, name, picture } = res.data;
      if (!email) throw new Error('Google token missing email');
      return { email, name, picture };
    }

    case 'facebook': {
      if (!token) throw new Error('Facebook accessToken required');
      // Optional: verify token belongs to your app
      // const appToken = `${process.env.FB_APP_ID}|${process.env.FB_APP_SECRET}`;
      // await axios.get(`https://graph.facebook.com/debug_token?input_token=${token}&access_token=${appToken}`);

      const res = await axios.get(`https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${token}`);
      const { email, name, picture } = res.data;
      if (!email) throw new Error('Facebook token missing email');
      return { email, name, picture: picture?.data?.url };
    }

    case 'apple': {
      if (!token) throw new Error('Apple identityToken required');
      const clientId = process.env.APPLE_CLIENT_ID;
      const res = await appleSignin.verifyIdToken(token, {
        audience: clientId,
        ignoreExpiration: false,
      });
      const { email, sub } = res;
      if (!email) throw new Error('Apple token missing email');
      return { email, name: `AppleUser-${sub}`, picture: null };
    }

    default:
      throw new Error('Unsupported provider');
  }
}

module.exports = { verifySocialLogin };
