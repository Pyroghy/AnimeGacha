# AnimeGacha

How To Start Bot:
1. download bots source code
2. npm install
3. rename .env.example to .env and enter in your data
4. start the bot with 'node .' or node 'index.js'

This project will continue to be updated with new features as time goes on

To create character models to use with the bot I recommend using [this api](https://anilist.gitbook.io/anilist-apiv2-docs/)

**Character Model Format**: { 
    "Owner": "null", 
    "Name": "Name of character", 
    "Url": "Url to character", 
    "Id": "Id of character",
    "Gender": "Male or Female", 
    "Series": { 
        "Title": "Title of series",
        "Type": "ANIME or MANGA or CUSTOM" 
    }, 
    "Image": "Link to character image", 
    "Stats": { 
        "Smash": 0, 
        "Pass": 0 
    }
}

*I will also be releasing a character generator in the future*
