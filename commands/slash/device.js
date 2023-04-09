const {SlashCommandBuilder, CommandInteraction, EmbedBuilder} = require("discord.js");
const {searchVideo, fetchAnime} = require("../../functions/search")
const MessageEmbed = EmbedBuilder;
module.exports = {
    data: new SlashCommandBuilder()
        .setName("device")
        .setDescription("Huh? You want me to borrow one of my device? Sure, which one?")
        .addSubcommand(subcmd=>
            subcmd
                .setName("find_video")
                .setDescription("This device is powerful, it helps me find a tutorial like how to use magic!")
                .addStringOption(opt=>
                    opt
                        .setName("query")
                        .setDescription("You will need a prompt before using this device")
                        .setRequired(true)
                )
                .addIntegerOption(opt=>
                    opt
                        .setName("max")
                        .setDescription("I used this parameter if I can't find the tutorial on first search, it's optional though")
                )
        )
        .addSubcommand(subcmd =>
            subcmd
                .setName("fetch_anime")
                .setDescription("I liked this device, it's giving me detailed information about anime media")
                .addStringOption(opt =>
                    opt
                        .setName("query")
                        .setDescription("You will need a prompt before using this device")
                        .setRequired(true)
                )
        ),
    /**
     * @param {CommandInteraction} interaction 
    */
   async execute(interaction){
       const getSubPicked = interaction.options.getSubcommand();
       if(getSubPicked){
           const getSubName = getSubPicked;
           const subOpt = interaction.options;
           switch(getSubName){
               case "find_video":
                   const query = subOpt.getString("query");
                   const num = subOpt.getInteger("max");
                   await interaction.deferReply();
                    if(num != null){
                        const videos = await searchVideo(query, num);
                        interaction.editReply(videos.join("\n"));
                        return;
                    }
                    const videos = await searchVideo(query);
                    await interaction.editReply({content: videos.shift()});
                break;
               case "fetch_anime":
                    const queryAnime = subOpt.getString("query");
                    await interaction.deferReply();
                    let metaData = null;
                    try{
                        metaData = await fetchAnime(queryAnime);
                    }catch(e){
                        interaction.reply("Whoops, the device broke. Hmm, let's try again later");
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
                    await interaction.followUp({
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
            }
        }
    }
};