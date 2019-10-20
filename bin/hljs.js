#!/usr/bin/env node

const yeoman = require('yeoman-environment');
const program = require('commander');
const env = yeoman.createEnv();

program
  .command('language', 'scaffold a language package').alias('syntax')
  .command('style', 'scaffold a style package').alias('theme')
  .parse(process.argv);
