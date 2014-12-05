'use strict';

module.exports = function (grunt) {

    return {
        server: {
            host: '192.168.1.125',
            username: 'lars',
            agent: process.env.SSH_AUTH_SOCK,
            agentForward: true

        },
        deploy: {
            command: ['cd /BADI/dzb-cloud-reader', 'git pull origin'].join(' && '),
            options: {
                config: 'server'
            }
        }
    };
};
