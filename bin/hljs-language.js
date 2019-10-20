#!/usr/bin/env node

const yeoman = require('yeoman-environment');

yeoman
  .createEnv()
  .register(require.resolve('../generators/language'), 'hljs')
  .run('hljs');
