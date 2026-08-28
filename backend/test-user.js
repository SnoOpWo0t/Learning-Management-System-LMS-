const strapi = require('@strapi/strapi');
strapi().start().then(async (app) => {
  const user = await app.db.query('plugin::users-permissions.user').findOne({where: {username: 'StudentDemo'}, populate: ['avatar']});
  console.log(user);
  process.exit(0);
});
