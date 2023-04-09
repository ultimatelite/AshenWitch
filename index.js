const Discord = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");
require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3030;

const {GatewayIntentBits, Events, REST, Routes} = Discord;
const Intents = GatewayIntentBits;
const client = new Discord.Client({
    intents: [
        Intents.Guilds,
        Intents.GuildMembers,
        Intents.GuildModeration,
        Intents.GuildEmojisAndStickers,
        Intents.GuildIntegrations ,
        Intents.GuildWebhooks,
        Intents.GuildInvites,
        Intents.GuildVoiceStates,
        Intents.GuildPresences ,
        Intents.GuildMessages,
        Intents.GuildMessageReactions,
        Intents.GuildMessageTyping,
        Intents.DirectMessages,
        Intents.DirectMessageReactions,
        Intents.DirectMessageTyping ,
        Intents.MessageContent,
        Intents.GuildScheduledEvents,
        Intents.AutoModerationConfiguration,
        Intents.AutoModerationExecution
    ]
});
client.slashCommands = new Discord.Collection();
client.messageCommands = new Discord.Collection();

process.on("uncaughtException", (err)=>{
    console.error(err);
});

const baseCommandPath = path.join(__dirname, "commands");
const slashCommandPath = path.join(baseCommandPath, "slash");
const messageCommandPath = path.join(baseCommandPath, "message");
const slashCommandFiles = fs.readdirSync(slashCommandPath).filter(f => f.endsWith(".js"));
const messageCommandFiles = fs.readdirSync(messageCommandPath).filter(f => f.endsWith(".js"));

let registeredSlashCommands = [];

for(let messageCommandFile of messageCommandFiles){
    const filePath = path.join(messageCommandPath, messageCommandFile);
    const command = require(filePath);
    if('name' in command && 'execute' in command){
        client.messageCommands.set(command.name, command);
        console.info(`[INFO] Set new listener for message file "${messageCommandFile}", with command name: ${command.name}`);
    }else{
        let error_why = `[WARN] File "${messageCommandFile}" missing out the required fields: `;
        error_why += (!('name' in command)) ? "name field " : "";
        error_why += (!('name' in command)) ? ((!('execute' in command)) ? "and execute function" : "") : "execute function";
        console.warn(error_why);
    }
}

for(let slashCommandFile of slashCommandFiles){
    const filePath = path.join(slashCommandPath, slashCommandFile);
    const command = require(filePath);
    if('data' in command && 'execute' in command){
        client.slashCommands.set(command.data.name, command);
        registeredSlashCommands.push(command.data.toJSON());
        console.info(`[INFO] Set new listener for slash file "${slashCommandFile}", with command name: ${command.data.name}`);
    }else{
        let error_why = `[WARN] File "${slashCommandFile}" missing out the required fields: `;
        error_why += (!('data' in command)) ? "data fields " : "";
        error_why += (!('data' in command)) ? ((!('execute' in command)) ? "and execute function" : "") : "execute function";
        console.warn(error_why);
    }
}
const slashJson = require("./slashdata.json");


const failMessages = [
    'Woops, I think I messed up the magic spell, gomen nasai!',
    'Ah, that went badly that I think it will',
    "Hmm, it seems like that spell is unstable, try again later!",
    "A, watashi o yurushitekudasai, sore wa watashi no seidesu..."
];
console.log(`AshenWitch is packing up to prepare for a long journey...`);
console.log(`Needs to pack ${registeredSlashCommands.length} items, takes a while!`);
const rest = new REST({version: "10"}).setToken(process.env.BOT_TOKEN);
(async()=>{
    try{
        const data = await rest.put(
            Routes.applicationGuildCommands(slashJson.clientId, slashJson.guildId),
            {body: registeredSlashCommands}
        );
        console.log(`Packed up ${data.length} things out of ${registeredSlashCommands.length}!`);
    }catch(err){
        console.error(`Failed to pack things: ${err}`);
    }
})();

// for debugging
client.on(Events.Debug, console.log);
// ready state
client.on(Events.ClientReady, async ()=>{
    console.log(`${client.user.tag} is ready to wander around the world!`);
    client.user.setPresence({status: "idle"});
});
// interaction handler
client.on(Events.InteractionCreate, async(interaction)=>{
    if(!interaction.isCommand())return;
    if(interaction.channel.type == Discord.ChannelType.DM)return interaction.reply("Umm, who are you? Are you trying to kidnap me?");
    const command = interaction.client.slashCommands.get(interaction.commandName);
    if(!command)return;
    try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
        const rand_word = Math.floor(Math.random() * (failMessages.length+1)-1);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: failMessages[rand_word], ephemeral: true });
		} else {
			await interaction.reply({ content: failMessages[rand_word], ephemeral: true });
		}
	}
});
// message handler
client.on(Events.MessageCreate, async (message)=>{
    const botMentioned = `<@${client.user.id}>`;
    if(message.content.split(/ +/).shift().includes(botMentioned)){
        if(message.channel.type == Discord.ChannelType.DM){
            message.reply("Umm, who are you? Are you trying to kidnap me?");
            return;
        }
        if(message.author.bot)return;
        const args = message.content.slice(botMentioned.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        const command = client.messageCommands.get(commandName);
        if(!command)return;
        try{
            await command.execute(client, message, args);
        }catch(error){
            console.error(error);
            const rand_word = Math.floor(Math.random() * (failMessages.length-1)+1);
		    await message.channel.send({ content: failMessages[rand_word] });
        }
    }
});
client.login(process.env.BOT_TOKEN);
app.listen(PORT, ()=>{
    console.log(`Started web with port: ${PORT}`);
});

app.get("/", (req, res)=>{
    res.send("Yay I am alive!");
});