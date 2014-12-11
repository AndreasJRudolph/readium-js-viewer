'use strict';

module.exports = function (grunt) {

    return {
        
        'git-add': {
            command: 'git --no-pager add .',
            options: {
                //failOnError: true,
                stdout: true,
                stderr: true,
                execOptions: { cwd: 'build/cloud-reader'}
            }
        },
        'git-commit': {
            command: 'git --no-pager commit -am "update cloud reader"',
            options: {
                //failOnError: true,
                stdout: true,
                stderr: true,
                execOptions: { cwd: 'build/cloud-reader'}
            }
        },
        'git-push': {
            command: 'git --no-pager push origin master',
            options: {
                failOnError: true,
                stdout: true,
                stderr: true,
                execOptions: { cwd: 'build/cloud-reader'}
            }
        }
    };
};