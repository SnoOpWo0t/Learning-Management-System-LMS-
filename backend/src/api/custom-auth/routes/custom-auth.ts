export default {
  routes: [
    {
      method: 'GET',
      path: '/custom-auth/me',
      handler: 'custom-auth.me',
      config: {
        auth: false,
      },
    },
  ],
};
