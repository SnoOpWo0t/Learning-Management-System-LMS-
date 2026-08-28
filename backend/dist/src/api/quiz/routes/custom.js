"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    routes: [
        {
            method: 'POST',
            path: '/quizzes/:id/submit',
            handler: 'quiz.submit',
            config: {
                policies: [],
                middlewares: [],
            },
        },
    ],
};
