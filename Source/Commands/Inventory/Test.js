const mongoose = require('mongoose');

module.exports.run = async(bot, message, args) => {
    const CharacterModel = mongoose.model('Characters');
    const Name = args.join(' ').split(', ');
    const Character = await CharacterModel.find({ name: Name }).collation({ locale: 'en', strength: 2 });

    const CharacterList = Character.map((Character) => Character.name)

    if(Name.length !== CharacterList.length) {
        return console.log('!n!o!')
    }
    else {
        console.log(CharacterList.name)
    }





};

module.exports.help = {
    name: "test",
    aliases: ["a"],
};