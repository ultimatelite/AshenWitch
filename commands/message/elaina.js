const {Client, Message, AttachmentBuilder, inlineCode} = require("discord.js");
const {saveImage, unlinkSync} = require("../../functions/generate_images");
const getCommunityDict = require("../../functions/urbandict");
const MessageAttachment = AttachmentBuilder;
module.exports = {
    name: "elaina",
    /**
     * 
     * @param {Client} client 
     * @param {Message} message 
     * @param {String[]} args 
     */
    async execute(client, message, args){
        const getSubcommand = args[0];
        if(!getSubcommand)return message.reply("Kon'nichiwa, what are you looking for?");
        switch(getSubcommand){
            case "give_image":
                message.channel.send("Hold up let me search it on my camera...");
                const getPrompt = args.slice(1).join(" ");
                if(!getPrompt)return message.channel.send("Gomen, I don't understand what you want");
                const fileSave = message.author.id + ".jpeg";
                saveImage(getPrompt, fileSave)
                  .then(async d => {
                    if (d.status !== 0) {
                      // If there is an error, send an error message with mention
                      await message.reply("Strange, the card is broken... I'll try to fix it with my spell cast, try again later!");
                      console.error("Error code: " + d.errorMessage);
                      return;
                    }
                    setTimeout(()=>message.channel.send({
                      files: [new MessageAttachment(d.imagePath)]
                    }), 2500);
                    setTimeout(()=>unlinkSync(d.imagePath), 5000);
                  })
                  .catch(async e => {
                    // If there is an error, send an error message with mention.
                    await message.channel.send(`<@${message.author.id}> Woops, I think my camera broke. Come back later!`);
                    console.error(e);
                  });
            break;
            case "imitate":
              const msg = args.slice(1).join(" ");
              message.channel.send(msg);
            break;
            case "what_is":
              const termQuery = args.slice(1).join(" ");
              if(!termQuery)return message.reply("Give me a term o kudasai!");
              const getData = await getCommunityDict(termQuery);
              if(!getData.length)return message.reply("Gomen nasai, I don't have any knowledge of that term!");
              const authorOnly = ((m) => m.author.id == message.author.id);
              await message.channel.send(`There are ${getData.length} definitions I could think of, how much would you want?`);
              try{
                  const getHowManyCollection = await message.channel.awaitMessages({
                      time: 5000,
                      errors: ["time"],
                      filter: authorOnly,
                      max: 1
                  });
                  const getHowMany = getHowManyCollection.first().content;
                  if(isNaN(parseInt(getHowMany)))return message.reply("I couldn't understand what number are you asking. Be more specific? Please?");
                  const parsedHowMany = parseInt(getHowMany);
                  let msg = "Here are "
                      + ((parsedHowMany > getData.length) ? getData.length.toString() : parsedHowMany.toString())
                      + " definitions:\n\n";
                  if(parsedHowMany == 1){
                      const cleanDefinition = inlineCode(getData[0].definition.replace(/[\[|\]]/g, ""));
                      const example = inlineCode(getData[0].example.replace(/[\[|\]]/g, ""));
                      return message.channel.send(`<@${message.author.id}>, You asked for a definition of ${getData[0].word}, ${getData[0].word} is a ${cleanDefinition}\n\nan example is: ${example}`);
                    
                  }
                  if(parsedHowMany > getData.length){
                      for(let i = 0; i < getData.length; i++){
                          let constructDefinition = i + 1 + ": " + inlineCode(getData[i].definition.replace(/[\[|\]]/g, ""));;
                          msg += constructDefinition + "\n\n";
                      }
                  }else{
                    for(let i = 0; i < parsedHowMany; i++){
                        let constructDefinition = i + 1 + ": " + inlineCode(getData[i].definition.replace(/[\[|\]]/g, ""));;
                        msg += constructDefinition + "\n\n";
                    }
                  }
                  message.channel.send(`<@${message.author.id}>, ${msg}`);
              }catch(e){
                  message.channel.send(`<@${message.author.id}> You're late, I'll just say one definition instead.`);
                  console.error(e);
                  const cleanDefinition = inlineCode(getData[0].definition.replace(/[\[|\]]/g, ""));
                  const example = inlineCode(getData[0].example.replace(/[\[|\]]/g, ""));
                  message.channel.send(`<@${message.author.id}>, You asked for a definition of ${getData[0].word}, ${getData[0].word} is a ${cleanDefinition}\n\nan example is: ${example}`);
              }
            break;
            default:
              message.channel.send("Sit tight o kudasai, this broom might fall if you ask me of what I can't do.");
            break;
        }
    }
}