//Define everything
const Discord = require("discord.js");
const Sequelize = require('sequelize');
const db = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	// SQLite only
	storage: 'database.sqlite',
});
const Config = db.define('config', {
  server: {
    type: Sequelize.STRING
  },
  story: {
    type: Sequelize.STRING
  },
	reports: {
    type: Sequelize.STRING
  },
	auth: {
    type: Sequelize.STRING
  },
	logblacklist: {
    type: Sequelize.STRING
  },
	bannedWords: {
    type: Sequelize.STRING
  },
	story_text: {
    type: Sequelize.STRING
  },
	archive: {
    type: Sequelize.STRING
  },
});
const Messages = db.define('messages', {
  msg: {
    type: Sequelize.STRING
  },
  username: {
    type: Sequelize.STRING
  },
  userID: {
    type: Sequelize.STRING
  },
  chan: {
    type: Sequelize.STRING
  },
  avatar: {
    type: Sequelize.STRING
  },
	server: {
    type: Sequelize.STRING
  },
	server_id: {
    type: Sequelize.STRING
  },
});
var http = require('http');
const auth = require("./auth.json")
const bot = new Discord.Client({autoReconnect:true});
const fs = require('fs');
var survey = ''
var surveyActive = false
var surveyStart = ''
var opts = ''
var totalVotes = 0
var authcode = 000000
var mLog = []

var configswitch = false
//Login
bot.login(auth.token);

bot.once('ready', () => {
	bot.user.setStatus('type %help for help');
  console.log('-----------------------------------------');
	console.log('Logged in as: ' + bot.user.username + "#" + bot.user.discriminator + " (" + bot.user.id + ")");
  console.log('-----------------------------------------');
  Messages.sync();
	Config.sync();
});
bot.on("guildCreate", async guild => {
console.log(guild)
	await Messages.findAll({ where: { server: guild.id } })
  var guildCount = await Messages.count({ where: { server: guild.id } })
	console.log(guildCount)
	if(guildCount < 1) {
    console.log("New config for " + guild.name + " created.");
		//Create a config entry for servers that the bot joins
		Config.create({
			server: guild.id,
			story: '',
			reports: '',
			auth: '',
			logblacklist: '[]',
			bannedWords: '[]',
			story_text: '',
			archive: '[]'
	    });
		} else {
			console.log("New config not created: a config for " + guild.name + " already exists.")
		}

})

//fs.readFile("mlog.txt", "utf-8", (err, data) => {
//  mLog = eval(data)
//});
//I forgot what this does, and I'm not even sure we need it
const { exec } = require('child_process');
exec('node', (err, stdout, stderr) => {
  if (err) {
    // node couldn't execute the command
    return;
  }

  // the *entire* stdout and stderr (buffered)
  console.log(`stdout: ${stdout}`);
  console.log(`stderr: ${stderr}`);
});

//Web server for viewing logs
/*
//Keeping this commented out until i rewrite
http.createServer(function (req, res) {
if(req.url == "/logs") {
console.log('A user has requested access to ' + req.url)
  res.writeHead(200, {'Content-Type': 'text/html'});
res.write("<style>body {font-family: calibri;}</style>")
for(i=mLog.length-1; i >= 0; i--) {
  res.write('' + mLog[i][1].replace(/</g, '\\<') + ": " + mLog[i][3].replace(/</g, '\\<') + "</p><br>");

}
}

  res.end();
}).listen(8080);*/

var forceActive = false
var os = require("os");
var messageLog = []
const chan = "734460405447131196"
//This should be eventually taken out and replaced with the database in the public build
const monkeyID = {
  story: '734460405447131196',
  server: '627704667547107358',
  reports: '778450490819084309',
	auth: '773544478472536104',
	logBlacklist: [
		'698479142579994694',
		'770396474227294208',
		'773544478472536104',
		'629379743145263124',
		'778450490819084309'
	],
	//adjust this to be for each server's needs
	bannedWords: [
		''
	]
}
var serverID
//Leave this out
/* Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';*/
fs.readFile("messages.txt", "utf-8", (err, data) => {
  messageLog = eval(data)
});

//Checks if user voted yet
function canVote(id) {
for(i=0; i<=survey.length-1; i++) {
if(survey[i].includes(id)) {
return false;
break;
}
}
return true;
}
function parsePing(ping) {
if(ping.includes('!')) {
return ping.split('<@!')[1].split('>')[0]
}
else {
return ping.split('<@')[1].split('>')[0]
}
}
bot.on('message', async message => {
	//Failsafe script in case bot goes down when it's added to a server
try {
	await Messages.findAll({ where: { server: message.guild.id } })
	var guildCount = await Messages.count({ where: { server: message.guild.id } })
//	console.log(guildCount)
	if(guildCount < 1) {
		console.log("New config for " + message.guild.name + " created.");
		//Create a config entry for servers that the bot joins
		Config.create({
			server: message.guild.id,
			story: '',
			reports: '',
			auth: '',
			logblacklist: '[]',
			bannedWords: '[]',
			story_text: '',
			archive: '[]'
			});
		} else {
		//	console.log("New config not created: a config for " + message.guild.name + " already exists.")
		}
	} catch(err) {
		console.log("An error occured with finding the server ID.")
	}
//Make sure bot does not reply to it's own messages
	if(message.author.id != bot.user.id) {
  console.log(message.author.username + ": " + message.content)
  //mLog.push([(new Date()), message.author.username, message.author.id, message])
/*  fs.writeFile('mlog.txt', JSON.stringify(mLog), function (err) {
  if (err) return console.log(err);
  //console.log(user + ": " + message);
});*/




  try {
  serverID = '627704667547107358'
  }
  catch(err) {
  console.log(err)
  }
  if (message.content.substring(0, 1) == '%') {

      var args = message.content.substring(1).split(' ');
      var cmd = args[0];

      args = args.splice(1);
      //FUNCTIONS FOR COMMANDS GO HERE
      switch(cmd) {

          //
          //Displays current story
          case 'story':
					var s2conf = await Config.findOne({ where: { server: message.guild.id } });

            if(s2conf.get('story_text').length < 2000) {
              /*This is a far better approach to embeds than whatever discord.io was using*/
              var embed = new Discord.MessageEmbed()
              embed.setColor('#ff3c00')
              embed.setTitle('Current Story')
              embed.setDescription(s2conf.get('story_text'))
            message.channel.send(embed)
            console.log("message is less than 2k, sending")
          }
          else {
console.log("message is more than 2k, sending")

var embed = new Discord.MessageEmbed()
embed.setColor('#ff3c00')
embed.setTitle('Current Story')
embed.setDescription(s2conf.get('story_text').substring(0, 1998))
message.channel.send(embed)
message.channel.send("Story is more than 2000 characters, could not render entire text.")


          }


          break;
					case 'config':
					try {
					if(message.member.hasPermission("ADMINISTRATOR")) {
						try {
							//bot.channels.cache.get(args[1]).guild.id == message.guild.id || args[1] == "bannedwords"
						/*if(bot.channels.cache.get(args[1]).guild.id == message.guild.id) {
						} else {
							if(bot.channels.cache.get(args[1]).guild.id != null) {
							message.channel.send("This channel does exist, but it's not in your server. You trying to hijack another server or something?")
						}
					}
					*/
					switch(args[0]) {
					case 'reports':
					if(bot.channels.cache.get(args[1]).guild.id == message.guild.id) {
						try {

						 var conf = await Config.findOne({ where: { server: message.guild.id } });
    	conf.update({
        reports: args[1]
      })

  					bot.channels.cache.get(args[1]).send('This is the reports channel.')
						message.channel.send('Reports channel set to <#' + args[1] + ">")
					} catch(err) {
						message.channel.send('Error: ' + err)
					}
				} else {
					if(bot.channels.cache.get(args[1]).guild.id != null) {
					message.channel.send("This channel does exist, but it's not in your server. You trying to hijack another server or something?")
				}}
					break;

					case 'story':
						if(bot.channels.cache.get(args[1]).guild.id == message.guild.id) {
						try {

						 var conf = await Config.findOne({ where: { server: message.guild.id } });
    	conf.update({
        story: args[1]
      })

  					bot.channels.cache.get(args[1]).send('This is the story channel')
						message.channel.send('Story channel set to <#' + args[1] + ">")
					} catch(err) {
						message.channel.send('Error: ```' + err + '```')
					}
				} else {
					if(bot.channels.cache.get(args[1]).guild.id != null) {
					message.channel.send("This channel does exist, but it's not in your server. You trying to hijack another server or something?")
				}}
					break;
					case 'help':
					message.channel.send("- **%config reports [Channel ID]**: Set the channel where reports come in.\n- **%config auth [Channel ID]**: Set the auth channel for commands like %forcesurveyend\n- **%config story [Channel ID]**: Set the channel where users can play One Word Story\n- **%config bannedwords add [word]**: Add a word to a list of words that the bot will delete if a message has them.\n- **%config bannedwords remove [word]**: Removes a word from the banned word list.\n- **%config bannedwords view**: Views the list of banned words.")
					break;
					case 'bannedwords':
					configswitch = true
					console.log('bannedwords')
						var conf = await Config.findOne({ where: { server: message.guild.id } });
						switch(args[1]) {
							case 'add':
							var wordlist = JSON.parse(conf.get('bannedWords'))
							wordlist.push(args[2])
							conf.update({
				        bannedWords: JSON.stringify(wordlist)
				      })
							message.channel.send("The word \"" + args[2] + "\" was added to the banned word list.")
							break;
							case 'remove':
							var wordlist = JSON.parse(conf.get('bannedWords'))
							if(wordlist.indexOf(args[2]) != -1) {
							wordlist.splice(wordlist.indexOf(args[2]), 1)
							conf.update({
				        bannedWords: JSON.stringify(wordlist)
				      })
							message.channel.send("The word \"" + args[2] + "\" was removed from the banned word list.")
						} else {
							message.channel.send("The word \"" + args[2] + "\" is not on the banned word list.")
						}
							break;
							case 'view':
							var wordlist = JSON.parse(conf.get('bannedWords'))
							var pwordlist = ""
							for(i in wordlist) {
								pwordlist += wordlist[i] + "\n"
							}
							message.channel.send("List of banned words:\n" + pwordlist)
							break;
							case 'reset':

							conf.update({
				        bannedWords: '[]'
				      })
							message.channel.send("The banned word list was reset.")

							break;
						}
					break;
				}

		} catch(err) {
			message.channel.send("This channel does not exist.")
			console.log(err)
		}
		} else {
					message.channel.send("Sorry, you need administrator permissions to perform this command.")
				}
			} catch(err) {
				message.channel.send("This command doesn't work in DMs.")
			}
					break;
          case 'archive':
     fs.readFile("archive.txt", "utf-8", (err, data) => {
                  if(args[0] < 1 || args[0] > eval(data).length) {
     message.channel.send("Please choose an archive between 1 and " + eval(data).length)
     }
     else {
     if(args[0] == null) {
       message.channel.send("Please enter the archive you'd like to view (usage: %archive [archive ID])")
     }
     else if(isNaN(args[0])) {
       message.channel.send("Please enter an actual number (usage: %archive [archive ID])")

     }
     else {
       var embed = new Discord.MessageEmbed()
       embed.setColor('#ff3c00')
       embed.setTitle('Archive #' + args[0])
       embed.setDescription(eval(data)[args[0]-1].substring(0,1998))
     message.channel.send(embed)

         }
         }

     })
     break;
     case 'log':

		 if(message.guild != null) {

			 await Messages.findAll({ where: { server: message.guild.id } })
		   var mCount = await Messages.count({ where: { server: message.guild.id } })
			 if(args[0] < mCount && !isNaN(args[0]) && args[0] > 0 && args[0] % 1 == 0) {
     var mesg = await Messages.findOne({ where: { server: message.guild.id, server_id: args[0] - 1 } });
     if (mesg) {
	// equivalent to: UPDATE tags SET usage_count = usage_count + 1 WHERE name = 'tagName';
  var embed = new Discord.MessageEmbed()
  embed.setColor('#ff3c00')

  embed.setFooter('Log #' + args[0] + "/#" + mCount)
  embed.setAuthor(mesg.get('username'), mesg.get('avatar'))
  embed.setDescription(mesg.get('msg'))
  message.channel.send(embed)
 //message.channel.send(mesg.get('msg'));
}
} else {
message.channel.send('Please enter a valid log ID.')
}

} else {
	message.channel.send('Sorry, this command does not work through DMs.')
}
     break;
		 case 'feedback':
		 var reason = ""
		 for(i=0; i<=args.length-1; i++) {
		 	reason += args[i] + " "
		 }
		 reason = reason.substring(0, reason.length-1)
		 try {
			 var embed = new Discord.MessageEmbed()
			 embed.setColor('#ff3c00')
			 embed.setTitle('Feedback from ' + message.author.username + "#" + message.author.discriminator)
			// console.log(message)
			 embed.addField('User ID', message.author.id, true)
			 embed.addField('Server ID', message.channel.guild.id, true)
			 embed.addField('Server Name', message.channel.guild.name, true)
			 embed.setDescription(reason)
			 bot.channels.cache.get("866504888863293460").send(embed)
		// bot.channels.cache.get("866504888863293460").send(reason)
		 message.channel.send("Feedback successfully sent.")
	 		}
			catch(err) {
				message.channel.send("There was an error sending feedback")
			}
		 //message.delete()
		  break;
     case 'say':
     var reason = ""
     for(i=0; i<=args.length-1; i++) {
       reason += args[i] + " "
     }
     reason = reason.substring(0, reason.length-1)
     message.channel.send(reason)
	message.delete()
      break;
			case 'report':
			var conf = await Config.findOne({ where: { server: message.guild.id } });
			if(conf.get('reports') != '') {
			var reason = ""
			for(i=1; i<=args.length-1; i++) {
				reason += args[i] + " "
			}
			reason = reason.substring(0, reason.length-1)


var embed = new Discord.MessageEmbed()
embed.setColor('#ff3c00')
embed.setTitle('Report')
embed.setDescription('Reporter: <@' + message.author.id + '>\nUser Reported: ' + args[0] + '\nReason: ' + reason)
try {
bot.channels.cache.get(conf.get('reports')).send(embed)
message.channel.send( args[0] + ' has been reported for reason: "' + reason + '"')
}
catch(err) {
	message.channel.send("There was an error submitting the report, likely due to the fact that the channel no longer exists.")
}
}
else {
	message.channel.send("There is currently no reports channel set up. Please notify a server admin to fix this by having them type %config reports [channel]")
}
			break;
			case 'help':
			//console.log(channelID)
			message.channel.send('Normal commands:\n- **%help:** Display this menu\n- **%story:** View the current progress of the story\n- **%archive [Archive ID]:** View a specified archive\n- **%survey [option 1]//[option 2]//[option 3]//etc.:** Starts a survey that anyone can vote on\n- **%checksurvey:** Check the results of the current survey without ending it\n- **%endsurvey:** Ends the current survey (can only be used by whoever started the survey)\n- **%report [@user] [reason]:** Report a user to the server admins\n- **%say [message]:** Make monkey man say what you type\n-  **%feedback [message]:** Send feedback to my developer, such as a feature request, or how satisfied (or unsatisfied) you are with me. (Does not work for self-hosted version)\n\nAdmin-only commands:\n\n- **%clear:** Clears the current story\n- **%addtoarchive:** Adds current story to archives\n- **%config:** configure bot settings (type %config help for more info)')
			break;

			case 'survey':
	    if(!surveyActive) {
	    totalVotes = 0
	    surveyActive = true
            surveyStart = message.author.id
	    survey = ''
	    opts = ''
	    for(i=0;i<=args.length-1;i++) {
	    survey += args[i] + " "
	    }

	    survey = survey.split("//")
            for(i=0;i<=survey.length-1;i++) {
	    opts += (i+1) + " - **" + survey[i] + "**\n"
	    }
	    for(i=0;i<=survey.length-1;i++) {
	    survey[i] = [survey[i]]
	    }
	    console.log(survey)
			message.channel.send("Survey has been started by " + message.author.username + ". The options are:\n" + opts + "\nType \"%vote [option #]\" to vote.")
	   /* bot.sendMessage({
                  to: channelID,
                      message: 'Survey has been started by ' + user + '. The options are:\n' + opts + "\nType \"%vote [option #]\" to vote."
                    });*/
	} else {
		message.channel.send('There is currently another survey in progress. Please wait until the current one finishes.')
		/*	bot.sendMessage({
                  	to: channelID,
                      message: 'There is currently another survey in progress. Please wait until the current one finishes.'
                    });*/
}
	    break;

			case 'vote':
		 if(surveyActive) {
 if(!canVote(message.author.id)) {
	 message.channel.send('You have already voted. You cannot vote a second time.')
							/*	 bot.sendMessage({
									to: channelID,
											message: 'You have already voted. You cannot vote a second time.'
										});*/
} else {
 if(args[0] > survey.length || args[0] < 1) {
	 message.channel.send('Please enter a valid option.')
 /*bot.sendMessage({
									to: channelID,
											message: 'Please enter a valid option.'
										});*/

 } else {
		 if(isNaN(args[0])) {
			  message.channel.send('Please enter a valid option.')
						/*bot.sendMessage({
									to: channelID,
											message: 'Please enter a valid option.'
										});*/
						} else {
		 survey[args[0]-1].push(message.author.id)
		 console.log(survey)
		  message.channel.send('Successfully voted: ' + survey[args[0]-1][0])
					/*	bot.sendMessage({
									to: channelID,
											message: 'Successfully voted: ' + survey[args[0]-1][0]
										});*/
	 totalVotes ++
		 }}}}
		 else {
			 message.channel.send('No survey is currently active.')
						 /*bot.sendMessage({
									to: channelID,
											message: 'No surveys are currently active.'
										});*/

		 }
		 break;
		 case 'endsurvey':
	 	if(surveyActive) {
	 if(message.author.id == surveyStart) {

	 	surveyActive = false
	 	opts = ''
	 	for(i=0; i<=survey.length-1; i++) {
	 		if(totalVotes == 0) {
	 opts += "**" + survey[i][0] + "** - 0 votes (0%)\n"
	 } else {

	 		opts += "**" + survey[i][0] + "** - " + (survey[i].length-1) + " votes (" + Math.round(100*((survey[i].length-1)/totalVotes)) + "%)\n"
	 		}
	 	    }

			message.channel.send('Survey has ended. Here are the results:\n' + opts)
	 	} else {
			 message.channel.send('You cannot end this survey as you are not the one who started it.')


	 	}} else {
			 message.channel.send('No survey is currently active.')

	                     }
	 	break
		case 'checksurvey':
	  if(surveyActive) {

		opts = ''
		for(i=0; i<=survey.length-1; i++) {
			if(totalVotes == 0) {
	opts += "**" + survey[i][0] + "** - 0 votes (0%)\n"
	} else {

			opts += "**" + survey[i][0] + "** - " + (survey[i].length-1) + " votes (" + Math.round(100*((survey[i].length-1)/totalVotes)) + "%)\n"
			}
		    }
				message.channel.send('Current results:\n' + opts)


		} else {
			message.channel.send('No surveys are currently active.')

	                    }
	  break;
		case 'auth':
		if(forceActive && args[0] == authcode) {

		forceActive = false
		surveyActive = false
		opts = ''
		for(i=0; i<=survey.length-1; i++) {
			opts += "**" + survey[i][0] + "** - " + (survey[i].length-1) + " votes\n"

				}
				message.channel.send('Survey has been forcefully ended by ' + message.author.username + '. Here are the results:\n' + opts)

		}
		break;
		case 'forcesurveyend':
		if(message.member.hasPermission("ADMINISTRATOR")) {
		forceActive = false
		surveyActive = false
		opts = ''
		for(i=0; i<=survey.length-1; i++) {
			opts += "**" + survey[i][0] + "** - " + (survey[i].length-1) + " votes (" + Math.round(100*((survey[i].length-1)/totalVotes)) + "%)\n"

				}
				message.channel.send('Survey has been forcefully ended by ' + message.author.username + '. Here are the results:\n' + opts)
			}
			else {
				message.channel.send('Sorry, you need administrator permissions to use this command')
			}
		break;

      case 'addtoarchive':
     //Make sure user has admin perms before doing this
     if(message.member.roles.cache.has(monkeyID.admin)) {
     fs.readFile("archive.txt", "utf-8", (err, data) => {
       fs.readFile("story.txt", "utf-8", (err, data2) => {
     var arrayy = eval(data)
     arrayy.push(data2)
       fs.writeFile('archive.txt', JSON.stringify(arrayy), function (err) {
                if (err) return console.log(err);
                //console.log(user + ": " + message);
              });
     message.channel.send('Story added to archive.')

     });
     });
     }

     break;
		 case 'clear':
		 if(message.member.hasPermission("ADMINISTRATOR")) {
			 var sconf = await Config.findOne({ where: { server: message.guild.id } });
			 sconf.update({
			 story_text: ''
			 })
			 message.channel.send('Story cleared.')

		 }
		 else {
			 message.channel.send('You must have administrator permissions on this server to use this command.')

		 }
		 break;
		 
        }}

				///*
				try {
				var conf = await Config.findOne({ where: { server: message.guild.id } });
 //console.log(conf.get('story'))
 var smesg = await Messages.findAll({ where: { server: message.guild.id, chan: conf.get('story') } })
 var sCount = await Messages.count({ where: { server: message.guild.id, chan: conf.get('story') } })
	//var smesg = await Messages.findOne({ where: { server: message.guild.id, server_id: sCount} });
} catch(err) {
//	console.log("Server config not found; Message is likely a DM.")
}
try {
	//console.log(smesg[smesg.length-1].msg)
				if (message.content.includes(" ") && message.channel.id == conf.get('story')) {
	        message.delete()
	      }
	      else if (smesg[smesg.length-1].userID == message.author.id && message.channel.id == conf.get('story')){
	        message.delete()
	      }
	 else if (message.content.length > 25 && message.channel.id == conf.get('story')){
	        message.delete()
	      }
	      else if(message.channel.id == conf.get('story')){
	      //messageLog.push([message.content, message.author.id])

				var sconf = await Config.findOne({ where: { server: message.guild.id } });
				sconf.update({
				story_text: conf.get('story_text') + " " + message.content
				})


	    }
		} catch(err) {
	//		console.log('No story channel is setup for this server; ignoring')
		}

//Function that detects things like slurs and deletes them
try {
var wordlist = JSON.parse(conf.get('bannedWords'))
	for(i=0; i<=wordlist.length-1; i++) {
		if(message.content.includes(wordlist[i]) && !configswitch ) {
			message.delete()
		//	console.log(message.author)
			bot.users.cache.get(message.author.id).send("Your message has been deleted because it contains the word \"" + wordlist[i] + "\".")
			break;
		}
		else {
			configswitch = false
		}
	}
} catch(err) {
	//console.log("config not found")
}
}

  //console.log(message.author.id != bot.id)
//	console.log(message.author.id + " - " + bot.user.id)
	//console.log(message.guild.id)
	if(!monkeyID.logBlacklist.includes(message.channel.id) && message.guild != null) {
		await Messages.findAll({ where: { server: message.guild.id } })
	  var mCount = await Messages.count()

		Messages.findAndCountAll({where: {server: message.guild.id} }).then(result => {
  //  console.log(result.count);
    //console.log(result.rows);


  Messages.create({
      msg: message.content,
      username: message.author.username,
      userID: message.author.id,
      chan: message.channel.id,
      avatar: "https://cdn.discordapp.com/avatars/" + message.author.id + "/" + message.author.avatar + ".webp",
			server: message.guild.id,
			server_id: result.count
    });
});

	} else {
		console.log('Message not logged; Message is in blacklisted channel')
	}
	
    //return console.log('entry created')
});
