
module.exports = {
	name: 'dot',
	description: 'DOTing usernames',
	aliases: [],
	guildOnly: false,
	args: false,
	usage: '',
	execute:(message, args, client) => {
    (async function () {
		const { log } = console;
		const arg = require('arg');
		const path = require('path');
		const readline = require('readline');
		const chalk = require('chalk');
		const { fork } = require('child_process');
  
		const services = require(path.join(__dirname, '../services.json'));
		process.on('uncaughtException', errorAndDie);
		process.on('unhandledRejection', errorAndDie);
		global.liveOutput = !((args['--json'] || args['--pretty-json'] || args['--csv']));
  
		if (args['--name']) {
		  scan(args['--name']);
		} else {
		  prompt().then(scan);
		}
  
		async function prompt() {
		  console.log('DOT sherlock')
  
		  const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		  });
  
  if(!args[0]){
	message.channel.send("Please Provide a Username To hunt ! >W<")
  }
  let name = args.join('')
  
  console.log(name)
  message.channel.send(`\`\`\` 
  D /  .'  
  O %.' D0TING v.1.0 
  T.'   D0TING STARTED : ${name}
						(╯°□°）╯ ︵ ┻━┻             
  \`\`\``)
		  if (name.match(/^[^ /&?]+$/g)) {
			return name;
		  }
  
		  throw new Error('Name contains unauthorised characters. Cannot proceed.');
  
		}
		async function scan(name) {
		  global.finalResults = {};
		  const results = new Proxy(global.finalResults, {
			set: (target, prop, value) => {
			  switch (value) {
				case 'Checking...':
				  
				  Log(chalk.bold("[")+chalk.bold.yellow("*")+chalk.bold("]")+" "+chalk.bold.green(prop+": ")+chalk.dim(value));
				  break;
				case 'Not Found!':
  
					if (global.liveOutput && !args['--only-found']) {
						log(chalk.bold('[') + chalk.bold.red('-') + chalk.bold(']') + ' ' + chalk.bold.green(prop + ': ') + chalk.bold.yellow(value));
					}
				  break;
				case 'Error':
				  if (global.liveOutput && !args['--only-found']) {
					log(chalk.bold('[') + chalk.bold.red('X') + chalk.bold(']') + ' ' + chalk.bold.red(prop + ': ') + chalk.bold.red(value));
				  }
  
				  break;
				default:
				  if (global.liveOutput) {
					message.channel.send(` \`\✅ ${prop} : ${value} \``)
				  }
				  if (args['--only-found']) {
					target[prop] = value;
				  }
			  }
  
			  if (!args['--only-found']) {
				target[prop] = value;
			  }
			  
			},
			get: (target, prop) => {
		
			  return target[prop];
			   
			}
		  });
  
		  Object.keys(services).forEach(key => {
			const url = services[key].replace('{}', name);
  
			results[key] = 'Checking...';
  
			const worker = fork(path.join(__dirname, '../https-worker.js'));
			worker.on('message', r => {
			  if (typeof r === 'boolean') {
				results[key] = r ? url : 'Not Found!';
			  } else {
				results[key] = 'Error';
			  }
			});
			worker.send(url + ' ' + name);
		  });
		}
  
  
	  })();
		}
};
