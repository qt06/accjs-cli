#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const yargs = require('yargs');
const inquirer = require('inquirer');
const shell = require('shelljs');
const acet = require('accjs-chrome-extension-template');
const manifest = acet.getManifest();//require('./node_modules/accjs-chrome-extension-template/src/manifest.json');
const localeMessages = acet.getLocaleMessages();//require('./node_modules/accjs-chrome-extension-template/src/_locales/zh_CN/messages.json');
const askQuestions = () => {
  const questions = [
    {
      name: "aceName",
      type: "input",
      message: "What is the name of the chrome extension?"
    },
    {
      name: "aceDesc",
      type: "input",
      message: "What is the description of the chrome extension?"
    },
    {
      name: "aceAuthor",
      type: "input",
      message: "What is the author of the chrome extension?"
    },
    {
      name: "aceVersion",
      type: "input",
      message: "What is the version of the chrome extension?"
    },
    {
      name: "aceHomepage",
      type: "input",
      message: "What is the homepage of the chrome extension?"
    },
    {
      type: "list",
      name: "extType",
      message: "What is the chrome extension type?",
      choices: ["all", "content_scripts", "background"],
      filter: function(val) {
        return val;
      }
    },
    {
      name: "matchUrls",
      type: "input",
      when: function(answers) {
return answers.extType != "background";
},
      message: "What are the urls of content_scripts?"
    },
    {
      name: "runAt",
      type: "list",
      choices: ["document_end", "document_start", "document_idle"],
      when: function(answers) {
return answers.extType != "background";
},
      filter: function(val) {
        return val;
      },
      message: "When do the content_scripts run?"
    }
  ];
  return inquirer.prompt(questions);
};

const run = async (targetDir) => {
  // ask questions
  const answers = await askQuestions();
localeMessages.pluginName.message = answers.aceName;
localeMessages.pluginDesc.message = answers.aceDesc;
localeMessages.pluginAuthor.message = answers.aceAuthor;
manifest.version = answers.aceVersion;
manifest.homepage_url = answers.aceHomepage;


if(answers.extType == 'background') {
manifest.content_scripts = [];
} else {
manifest.content_scripts[0].matches = answers.matchUrls.split(' ');
manifest.content_scripts[0].run_at = answers.runAt;
}
if(targetDir != './') {
shell.exec('mkdir ' + targetDir);
}
shell.cp('-R', path.join(acet.getPath(), "*"), targetDir);
let rs = JSON.stringify(localeMessages, null, 2);
let rs1 = JSON.stringify(manifest, null, 2);
fs.writeFileSync(targetDir + '/_locales/zh_CN/messages.json', rs, 'utf-8');
fs.writeFileSync(targetDir + '/manifest.json', rs1, 'utf-8');
console.log('success');
};
let argv = yargs.command('init [dir]',
'create a new chrome extension',
{},
(args) => {
targetDir = args.dir || './';
run(targetDir);
}).help().argv;