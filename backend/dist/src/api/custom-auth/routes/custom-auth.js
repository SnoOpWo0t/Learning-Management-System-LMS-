"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    routes: [
        {
            method: 'GET',
            path: '/custom-auth/me',
            handler: 'custom-auth.me',
        },
        {
            method: 'PUT',
            path: '/custom-auth/me',
            handler: 'custom-auth.updateMe',
        },
    ],
};
