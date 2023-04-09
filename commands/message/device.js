const {Client, Message, EmbedBuilder, inlineCode} = require("discord.js");
const {searchVideo, fetchAnime} = require("../../functions/search");
const MessageEmbed = EmbedBuilder;
module.exports = {
    name: "device",
    /**
     * 
     * @param {Client} client 
     * @param {Message} message 
     * @param {String[]} args 
     */
    async execute(client, message, args){
        const getSubcommand = args[0];
        let query = null;
        if(!getSubcommand)return message.reply("Kon'nichiwa, what are you looking for?");
        switch(getSubcommand){
            case "find_video":
                const howManyArg = args.pop().toLowerCase();
                query = args.slice(1).join(" ");
                let numberOfVids = parseInt(howManyArg);
                if(howManyArg == "def_null_val" || isNaN(numberOfVids)){
                    const getArray = await searchVideo(query);
                    message.channel.send(getArray.shift());
                    return;
                }
                const getArray = await searchVideo(query, numberOfVids);
                for(let i in getArray){
                    message.channel.send(getArray[i]);
                }
            break;
            case "fetch_anime":
                query = args.slice(1).join(" ");
                let metaData = null;
                try{
                    metaData = await fetchAnime(query);
                }catch(e){
                    message.channel.send("Whoops, the device broke. Hmm, let's try again later");
                    console.error(e)
                }
                const description = (metaData.description.length > 1700) ? metaData.description.slice(1700) + "..." : metaData.description;
                const characters = metaData.chars;
                let optChar = "", isCharsAtFirstIter = true;
                if(characters.length > 15){
                    for(let i = 0; i < 15; i++){
                        if(!isCharsAtFirstIter)optChar += ", ";
                        optChar += characters[i];
                        isCharsAtFirstIter = false;
                    }
                    optChar += `...${characters.length-15} more.`;
                }else{
                    for(let i = 0; i < characters.length; i++){
                        if(!isCharsAtFirstIter)optChar += ", ";
                        optChar += characters[i];
                        isCharsAtFirstIter = false;   
                    }
                }
                message.channel.send({
                    content: inlineCode(`(As requested by ${message.author.tag})`),
                    embeds: [
                        new MessageEmbed()
                            .setTitle(`${metaData.title.english} (${metaData.title.native.toString()})`)
                            .setDescription(description.toString())
                            .addFields({
                                name: "Is R-Restricted?",
                                value: metaData.nsfw,
                                inline: true
                            }, {
                                name: "Number of episodes",
                                value: metaData.episodes.toString(),
                                inline: true
                            },{
                                name: "Average duration per episodes",
                                value: metaData.duration.toString(),
                                inline: true
                            }, {
                                name: "Released at Season",
                                value: metaData.season,
                                inline: true
                            },{
                                name: "Published method",
                                value: metaData.mediaType,
                                inline: true
                            },
                            {
                                name: "Original Source",
                                value: metaData.based,
                                inline: true
                            },
                            {
                                name: "Genres",
                                value: metaData.genres.join(", "),
                                inline: true
                            },
                            {
                                name: "Associated characters",
                                value: optChar,
                                inline: true
                            },
                            {
                                name: "Media relationship",
                                value: metaData.relationTypes.join(", "),
                                inline: true
                            },
                            {
                                name: "Tags",
                                value: metaData.tags.join(", ")
                            })
                            .setURL(metaData.url)
                            .setColor("Random")
                            .setThumbnail(metaData.cover)
                            .setImage(metaData.banner)
                            .setTimestamp()
                            .setFooter({text: `${metaData.status}: ${metaData.released}-${metaData.end}. ${metaData.avgRating}/${metaData.overallRating}`})
                    ]
                });
            break;
            default:
                message.channel.send("I'm sorry, I don't have that device.");
            break;
        }
    }
}