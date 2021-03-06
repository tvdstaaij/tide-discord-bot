'use strict';

const _ = require('lodash');
const config = require('config');
const Discord = require('discord.js');
const fs = require('fs');
const path = require('path');

const commands = _.remove(_.map(fs.readdirSync(path.resolve(__dirname)),
    (file) => {
      if (path.resolve(__dirname, `${file}`) == __filename) {
        return null; // This help file
      }
      const command = require(`./${file}`);

      if (_.get(config, `discord.commands[${command.name}].enabled`, true)) {
        return command;
      } else {
        return null;
      }
    }), null);

const NAME = 'help';
const DESCRIPTION = 'List all of my commands or info about a specific command.';

module.exports = {
  name: NAME,
  description: DESCRIPTION,
  aliases: ['commands'],
  usage: '[command name]',
  cooldown: 0,
  requiredChannelPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
  execute: async ({message, args}) => {
    if (!args.length) {
      const embed = new Discord.MessageEmbed()
          .setColor('LUMINOUS_VIVID_PINK')
          .setURL(`https://github.com/idelsink/tide-discord-bot`)
          .setAuthor(message.client.user.username,
              message.client.user.displayAvatarURL())
          .setThumbnail(message.client.user.displayAvatarURL())
          .setTitle(`${message.client.user.username} bot help`)
          .setDescription(
              'This bot is is a collection of random commands, ' +
              'designed for random things. ' +
              'The name `tide` comes from the ' +
              '[Trentemøller](https://www.trentemoller.com/) song tide ' +
              '[Tide](https://youtu.be/TxgX97g6DHQ).\n\n' +
              'For more information on a certain command, ' +
              'do `prefix help <name>`. ' +
              'Example: `prefix help ping`\n\n',
              'If you want to help with this bot, go take a look at ',
              '[idelsink/tide-discord-bot](https://github.com/idelsink/tide-discord-bot).',
          )
          .addField('Command syntax',
              'The bot can be used by sending messages in the form of: \n' +
              '`prefix command arguments`' );

      if (config.discord.commandPrefix.text.enabled) {
        const prefix = config.discord.commandPrefix.text.value;
        if (prefix) {
          embed.addField('Command prefix',
              `You can send a command to the bot ` +
              `using the prefix \`${prefix}\`.\n` +
              `Example: \`${prefix} ping\``);
        }
      }
      if (config.discord.commandPrefix.mention.enabled) {
        embed.addField('Command prefix with mention',
            `You can send a command to the bot ` +
            `using the mention ${message.client.user}.\n` +
            `Example: ${message.client.user} ping`);
      }

      embed.addField('\u200b', '**The following commands are available**');

      // Add this help command
      embed.addField(NAME, DESCRIPTION, false);
      commands.map((command) => {
        embed.addField(command.name, command.description, false);
      });

      embed.setFooter(
          `${message.client.user.username} bot by Ingmar Delsink\n` +
          'Made with ❤️');
      await message.channel.send({embed});
    } else {
      // Display specific help
      const name = _.head(args).toLowerCase();
      const command = _.find(commands, (command) => {
        return command.name == name ||
        (command.aliases && command.aliases.includes(name));
      });
      if (command) {
        const embed = new Discord.MessageEmbed()
            .setColor('LUMINOUS_VIVID_PINK')
            .setURL(`https://github.com/idelsink/tide-discord-bot`)
            .setAuthor(message.client.user.username,
                message.client.user.displayAvatarURL())
            .setThumbnail(message.client.user.displayAvatarURL())
            .setTitle(`Help for ${command.name}`)
            .setDescription(command.description)
            .addField('Name', command.name);

        if (command.aliases) {
          embed.addField('Aliases', command.aliases);
        }
        embed.addField('Usage',
            `\`<prefix> ${command.name} ${command.usage || ''}\``);
        await message.channel.send({embed});
      } else {
        await message.reply(`${name} is not a valid command!`);
      }
    }
  },
};
