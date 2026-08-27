import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // Bootstrap Roles
    const rolesToCreate = ['Admin', 'Content Manager', 'Instructor', 'Student'];

    const roleService = strapi.plugin('users-permissions').service('role');

    const existingRoles = await strapi.db.query('plugin::users-permissions.role').findMany({});
    const existingRoleNames = existingRoles.map(r => r.name);

    for (const roleName of rolesToCreate) {
      if (!existingRoleNames.includes(roleName)) {
        await roleService.createRole({
          name: roleName,
          description: `Custom ${roleName} role for LMS`,
        });
        strapi.log.info(`Created role: ${roleName}`);
      }
    }
  },
};
