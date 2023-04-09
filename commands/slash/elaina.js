const {SlashCommandBuilder, CommandInteraction, AttachmentBuilder, inlineCode} = require("discord.js");
const {saveImage, unlinkSync} = require("../../functions/generate_images");
const getCommunityDict = require("../../functions/urbandict");
const MessageAttachment = AttachmentBuilder;
module.exports = {
    data: new SlashCommandBuilder()
        .setName("elaina")
        .setDescription("Huh, what do you want from me?")
        .addSubcommand(subcmd =>
            subcmd
                .setName("give_image")
                .setDescription("I have some image collections, what would you like?")
                .addStringOption(opt => 
                        opt
                        .setName("prompt")
                        .setDescription("Tells me which image you want to see")
                        .setRequired(true)
                )
        )
        .addSubcommand(subcmd =>
            subcmd
                .setName("imitate")
                .setDescription("Okay, I'll listen and repeat the words you said!")
                .addStringOption(opt =>
                    opt
                      .setName("words")
                      .setDescription("What words would you like for me to repeat?")
                      .setRequired(true)
                )
        )
        .addSubcommand(subcmd =>
          subcmd.setName("what_is")
            .setDescription("\"What is [term]?\" Let me think...")
            .addStringOption(opt=>
              opt.setName("term")
                .setDescription("So what term would you like me to know about?")
                .setRequired(true)
            )

            .addIntegerOption(opt=>
                opt.setName("definitions")
                  .setDescription("How many definitions do you want?")
              )
        ),
        /**
         * 
         * @param {CommandInteraction} interaction 
         */
    execute: async function(interaction){
        const getSubPicked = interaction.options.getSubcommand();
        if(getSubPicked){
            const getSubName = getSubPicked;
            const subOpt = interaction.options;
            switch(getSubName){
                case "give_image":
                // Defer the reply to indicate that the bot is still processing the request
                await interaction.deferReply();
                            
                // Process the image
                const authorId = interaction.user.id.toString();
                saveImage(subOpt.getString("prompt"), authorId + ".jpeg")
                  .then(async d => {
                    if (d.status !== 0) {
                      // If there is an error, send an error message using editReply
                      await interaction.editReply("Strange, the card is broken... I'll try to fix it with my spell cast, try again later!");
                      console.error("Error code: " + d.errorMessage);
                      return;
                    }
                
                    // If the image is processed successfully, send the image using followUp
                    setTimeout(()=>interaction.editReply({
                      files: [new MessageAttachment(d.imagePath)]
                    }), 2500);
                    setTimeout(()=>unlinkSync(d.imagePath), 5000);
                  })
                  .catch(async e => {
                    // If there is an error, send an error message using editReply
                    await interaction.editReply("Woops, I think my camera broke. Come back later!");
                    console.error(e);
                  });
                break;
                case "imitate":
                  await interaction.reply(subOpt.getString("words"));
                break;
                case "what_is":
                  await interaction.deferReply();
                  const getTerm = subOpt.getString("term");
                  const getData = await getCommunityDict(getTerm);
                  const count = subOpt.getInteger("definitions");
                  if(count){
                      if(count == 1){
                          const cleanDefinition = inlineCode(getData[0].definition.replace(/[\[|\]]/g, ""));
                          const example = inlineCode(getData[0].example.replace(/[\[|\]]/g, ""));
                          return interaction.editReply(`You asked for a definition of ${getData[0].word}, ${getData[0].word} is a ${cleanDefinition}\n\nan example is: ${example}`);
                      }
                      let msg = "Here are "
                        + ((count > getData.length) ? getData.length.toString() : count.toString())
                        + " definitions:\n\n";
                      if(count > getData.length){
                          for(let i = 0; i < getData.length; i++){
                              let constructDefinition = i + 1 + ": " + inlineCode(getData[i].definition.replace(/[\[|\]]/g, ""));;
                              msg += constructDefinition + "\n\n";
                          }
                      }else{
                        for(let i = 0; i < count; i++){
                            let constructDefinition = i + 1 + ": " + inlineCode(getData[i].definition.replace(/[\[|\]]/g, ""));;
                            msg += constructDefinition + "\n\n";
                        }
                      }
                      interaction.editReply(msg);
                  }else{
                      const cleanDefinition = inlineCode(getData[0].definition.replace(/[\[|\]]/g, ""));
                      const example = inlineCode(getData[0].example.replace(/[\[|\]]/g, ""));
                      interaction.editReply(`You asked for a definition of ${getData[0].word}, ${getData[0].word} is a ${cleanDefinition}\n\nan example is: ${example}`);
                  }
                  break;
            }
        }
    }
}