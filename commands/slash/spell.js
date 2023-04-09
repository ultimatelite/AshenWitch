const {SlashCommandBuilder, CommandInteraction, EmbedBuilder} = require("discord.js");
const MessageEmbed = EmbedBuilder;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("spell_cast")
        .setDescription("Which spell casts would you like me to apply on you?")
        .addSubcommand(subcmd=>
            subcmd.setName("pretty_message")
                .setDescription("Okay, I'll create a pretty message for you.")
                .addStringOption(opt=>
                    opt.setName("title")
                        .setDescription("What will you title this message?")
                        .setRequired(true)
                )
                .addStringOption(opt=>
                    opt.setName("description")
                        .setDescription("What will you describe this message?")
                        .setRequired(true)
                )
                .addStringOption(opt=>
                    opt.setName("embeds")
                        .setDescription("Do you have any field message for me attach on?")
                )
                .addStringOption(opt=>
                    opt.setName("url")
                        .setDescription("Do you have any destination of your message?")
                )
                .addStringOption(opt=>
                    opt.setName("image")
                        .setDescription("Do you want me to attach image to your message?")
                )
        ),
        /**
         * 
         * @param {CommandInteraction} interaction 
         */
    async execute(interaction){
        const getSubPicked = interaction.options.getSubcommand();
        const subOpt = interaction.options;
        if(getSubPicked){
            switch(getSubPicked){
                case "pretty_message":
                    await interaction.deferReply();
                    const embedAvailable = subOpt.getString("embeds");
                    let getEmbed = [];
                    if(embedAvailable){
                        const getListedEmbeds = embedAvailable.match(/\([^)]+?(?=\s*\))/g);
                        for(let embed of getListedEmbeds){
                            const cleansedString = embed.replace(/[\(|\)]/g, '');
                            const getEmbedData = cleansedString.split(";;");
                            // I will never construct a field message less than the required forms :D
                            if(getEmbedData.length >= 2){
                                const checkIfInline = (getEmbedData.length >= 3) ? (getEmbedData[2].toLowerCase().replace(/ +/, "") == "yes") : false;
                                const constructEmbed = {
                                    name: getEmbedData[0],
                                    value: getEmbedData[1],
                                    inline: checkIfInline
                                };
                                getEmbed.push(constructEmbed);
                            }
                        }
                    }
                    let gatherData = {
                        title: subOpt.getString("title"),
                        description: subOpt.getString("description"),
                        embeds: getEmbed,
                        image: subOpt.getString("image"),
                        url: subOpt.getString("url")
                    };
                    await interaction.editReply({
                        embeds: [
                            new MessageEmbed()
                            .setTitle(gatherData.title)
                            .setDescription(gatherData.description)
                            .addFields(gatherData.embeds)
                            .setURL(gatherData.url)
                            .setThumbnail(gatherData.image)
                            .setFooter({text: `The spell cast request by ${interaction.user.tag}`})
                            .setAuthor({name: interaction.user.username, iconURL: interaction.user.displayAvatarURL()})
                            .setTimestamp()
                            .setColor("Random")
                        ]
                    });
                break;
                default:
                    await interaction.reply("<@" + interaction.user.id + "> Gomen nasai, I don't have that spell yet.");
                break;
            }
        }
    }
        
}