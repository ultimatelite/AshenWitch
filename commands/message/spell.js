const {Client, Message, EmbedBuilder} = require("discord.js");
const MessageEmbed = EmbedBuilder;
module.exports = {
    name: "spell_cast",
    /**
     * 
     * @param {Client} client 
     * @param {Message} message 
     * @param {String[]} args 
    */
    async execute(client, message, args){
        const getSubCmd = args[0];
        switch(getSubCmd){
            case "pretty_message":
                let jsonFormat = {};
                try{
                    jsonFormat = args.slice(1).join(" ");
                }catch(e){
                    message.reply("Sorry, I cannot read your words, could you be more specific?");
                    console.error(e);
                }
                if(!jsonFormat)message.channel.send(`${message.author}, I need your words to make it prettier.`);
                const jsonified = JSON.parse(jsonFormat);
                if(!("title" in jsonified))return await message.reply("What will your message title will be?");
                if(!("description" in jsonified))return await message.reply("What will your message description will be?");
                
                message.channel.send({
                    embeds: [
                        new MessageEmbed()
                            .setTitle(jsonified.title.toString())
                            .setDescription(jsonified.description.toString())
                            .setAuthor({name: message.author.username, iconURL: message.author.displayAvatarURL()})
                            .setURL(("url" in jsonified) ? jsonified.url.toString() : null)
                            .setThumbnail(("image" in jsonified) ? jsonified.image : null)
                            .addFields(("embeds" in jsonified) ? jsonified.embeds : [])
                            .setFooter({text: `The spell cast request by ${message.author.tag}`})
                            .setTimestamp()
                            .setColor("Random")
                    ]
                });
                break;
            default:
                message.channel.send("<@" + message.author.id + "> Gomen nasai, I don't have that spell yet.");
                break;
        }
    }
}