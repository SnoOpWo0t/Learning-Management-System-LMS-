"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    async me(ctx) {
        try {
            const authUser = ctx.state.user;
            if (!authUser) {
                return ctx.unauthorized('User not authenticated');
            }
            const user = await strapi.entityService.findOne('plugin::users-permissions.user', authUser.id, {
                // @ts-ignore
                populate: ['role', 'avatar'],
            });
            if (!user) {
                return ctx.unauthorized('User not found');
            }
            // Sanitize user object to avoid leaking sensitive fields
            // @ts-ignore
            const { password, resetPasswordToken, confirmationToken, ...sanitizedUser } = user;
            ctx.body = sanitizedUser;
        }
        catch (err) {
            console.error('Error in me():', err.message, err.stack);
            return ctx.unauthorized('Invalid token');
        }
    },
    async updateMe(ctx) {
        try {
            const authUser = ctx.state.user;
            if (!authUser) {
                return ctx.unauthorized('User not authenticated');
            }
            const { username, bio, avatar, phoneNumber } = ctx.request.body;
            const dataToUpdate = {};
            if (username !== undefined)
                dataToUpdate.username = username;
            if (bio !== undefined)
                dataToUpdate.bio = bio;
            if (avatar !== undefined)
                dataToUpdate.avatar = avatar;
            if (phoneNumber !== undefined)
                dataToUpdate.phoneNumber = phoneNumber;
            const user = await strapi.entityService.update('plugin::users-permissions.user', authUser.id, {
                data: dataToUpdate,
                // @ts-ignore
                populate: ['role', 'avatar'],
            });
            // Sanitize
            // @ts-ignore
            const { password, resetPasswordToken, confirmationToken, ...sanitizedUser } = user;
            ctx.body = sanitizedUser;
        }
        catch (err) {
            console.error('Error in updateMe():', err.message, err.stack);
            return ctx.badRequest('Error updating profile');
        }
    }
};
