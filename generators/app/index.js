const Generator = require('yeoman-generator');
const yeoman = require('yeoman-environment');

module.exports = class extends Generator {
  inquirer() {
    return this.prompt([
      {
        name: 'type',
        message: 'Type of Highlight.js add-on',
        type: 'list',
        store: true,
        choices: [
          {
            name: 'Language',
            value: 'language'
          },
          {
            name: 'Style',
            value: 'style'
          }
        ]
      },
    ]).then(props => {

      const env = yeoman.createEnv();
      env.register(require.resolve(`../${props.type}`), `hljs:subgenerator`);

      env.run(
        `hljs:subgenerator`,
      );

    });
  }
};
