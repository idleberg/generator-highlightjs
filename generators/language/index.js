const Generator = require('yeoman-generator');
const semver = require('semver');
const slugify = require('@sindresorhus/slugify');
const spdxLicenseList = require('spdx-license-list/full');
const terminalLink = require('terminal-link');
const { basename, extname, resolve } = require('path');
const { pascalCase } = require('change-case');

// Create array of license choices
const spdxCodes = Object.getOwnPropertyNames(spdxLicenseList).sort();
const licenseChoices = spdxCodes.map(obj => {
  const licenses = {};

  licenses['name'] = terminalLink(obj, `https://spdx.org/licenses/${obj}.html`, {
    fallback() {
      return obj;
    }
  });

  licenses['value'] = obj;

  return licenses;
});

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);
  }

  inquirer() {
    return this.prompt([
      {
        name: 'name',
        message: answers => `Name (e.g. C++)`,
        store: true,
        validate: str => {
          if (str.length === 0) {
            return 'The name cannot be empty';
          } else if (str.includes('highlightjs') || str.includes('highlight.js-') || str.includes('highlight-') || str.includes('hljs-')) {
            return 'The name shouldn\'t contain any reference to highlight.js';
          }

          return true;
        }
      },
      {
        name: 'slug',
        message: answers => `Slug (e.g. cpp)`,
        default: answers => slugify(answers.name),
        store: true,
        validate: str => {
          if (str.length === 0) {
            return 'The slug cannot be empty';
          } else if (str.includes('highlightjs') || str.includes('highlight.js-') || str.includes('highlight-') || str.includes('hljs-')) {
            return 'The slug shouldn\'t contain any reference to highlight.js';
          }

          return true;
        }
      },
      {
        name: 'description',
        message: answers => `Short description`,
        default: answers => `highlight.js syntax definition for the ${answers.name} language`,
        store: true,
        validate: str => {
          return (str.length === 0 && this.allowEmptyDescription === false) ? 'The description cannot be empty' : true;
        }
      },
      {
        name: 'version',
        message: `Initial version`,
        default: '0.1.0',
        store: true,
        validate: version => ( semver.valid(version) !== null) ? true : `Please provide a valid ${terminalLink('semantic version', 'https://semver.org', {
          fallback() {
            return 'semantic version';
          }
        })}`
      },
      {
        name: 'author',
        message: 'Author\'s name',
        default: async () => {
          let username;

          try {
            username = await this.user.github.username();
          } catch (error) {
            username = '';
          }

          return username;
        },
        store: true,
        validate: x => x.length > 0 ? true : 'Please provide a valid author name'
      },
      {
        type: 'list',
        name: 'license',
        message: 'Pick a license',
        default: 'BSD-3-Clause',
        store: true,
        choices: licenseChoices,
      },
      {
        type: 'confirm',
        name: 'installDeps',
        message: 'Install dependencies?',
        default: true,
        store: true,
      }
    ]).then( props => {
      props.type = 'language';
      props.pascalCase = pascalCase(props.name);
      props.licenseName = spdxLicenseList[props.license].name;
      props.licenseURL = spdxLicenseList[props.license].url;
      props.date = new Date().toISOString().split('T')[0];

      const copyFiles = [
        '_circleci/config.yml.ejs',
        '_editorconfig.ejs',
        '_eslintrc.json.ejs',
        '_gitignore.ejs',
        '_npmignore.ejs',
        'main.js.ejs',
        'package.json.ejs',
        'README.md.ejs',
        'test/fixtures/actual.txt.ejs',
        'test/fixtures/expected.txt.ejs',
        'test/index.js.ejs',
      ];

      copyFiles.forEach( copyFile => {
        const destFile = (copyFile === 'main.js.ejs') ? `${props.slug}.js` : copyFile
          .replace(/^_/, '.')
          .replace(/\.ejs$/, '');

        this.fs.copyTpl(
          this.templatePath(copyFile),
          this.destinationPath(destFile),
          {
            props: props
          }
        );
      });

      if (props.installDeps) {
        this.yarnInstall();
      }
    });
  }
};
