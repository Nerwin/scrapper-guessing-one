import { Meteor } from 'meteor/meteor';

import { HTTP } from 'meteor/http';
import Future from 'fibers/future';

var fs = require('fs');
var util = require('util');

Meteor.startup(() => {
    //scrapData();


    //sncfPost();
    //transformSouthParkData()
    //transformWordsData();

    getEnglishWord();
    //parsePassword();
});

// var url = 'https://wshoraires.vsct.fr/m340/horaireetresasam/json/midService/';
var url = 'http://127.0.0.1:12345/m340/horaireetresasam/json/midService/';
function sncfPost() {


    HTTP.call("POST", "https://wshoraires.vsct.fr/m340/horaireetresasam/json/midService/",
        {
            headers: {
                'content-type': 'application/json; charset=UTF-8',
                'user-agent': 'navigator.userAgent',
                'x-hr-version': '34.04',
                'x-device-type': 'ANDROID'
            },
            data: {
                'request': {
                    'login': "hippolyte.lacroix@epsi.fr",
                    'token': "CCLCAMP73-03389fd027b664c953cebc797a98dd4838477f0d",
                    "country": "FR",
                    "language": "fr"
                }
            }
        },
        function (error, result) {
            if (error) {
                throw err;
            }

            console.log(result);
        });


    // { "request":{ "login":"hippolyte.lacroix@epsi.fr", "password":"ABCD4abcd", "country":"FR", "language":"fr" } }
}

function transformSouthParkData() {
    var data = JSON.parse(Assets.getText('data.json'));
    let defaultImg = 'http://southparkstudios.mtvnimages.com/default/wiki_characters.jpg?height=165';

    _.forEach(_.reject(data.characters, function (x) { return x.url === defaultImg }), function (character, index) {
        data.characters[index] = transformList(character);
    });
}

function transformWordsData() {
    var data = JSON.parse(Assets.getText('words.json'));

    _.forEach(data.words, function (word, index) {
        console.log(word);
    });
}

function getEnglishWord() {
    listOfWords = getWords();
}


var numberRegex = /([0-9]+)/g;
var aliasRegex = /([$][A-Z][a-z]+[$])/g;

transformList = function (character) {

    let alias = character.name.match(aliasRegex);
    if (alias != null) {
        let name = character.name;
        character.name = name.replace(aliasRegex, '').replace(/\s+/g, " ");
        character.alias = alias[0].substring(1, alias[0].length - 1);
    }
    if (character.hasOwnProperty('firstappearance'))
        character.firstappearance = character.firstappearance.replace(/ *\([^)]*\) */g, " ").trim();

    if (character.hasOwnProperty('religion'))
        character.religion = character.religion.split(',')[0];

    if (character.hasOwnProperty('age')) {
        let age = character.age.split('-')[0];
        if (age.includes('(Deceased)')) {
            character.age = age.replace(/ *\([^)]*\) */g, " ").trim();
            character.isDead = true;
        }


        if (character.age.match(numberRegex)[0] < 21)
            character.isChild = true;
    }

    // Write in file
    // let text = JSON.stringify(character) + ',';
    // fs.appendFile("E:/southpark.json", text, 'utf-8', function (err) {
    //     if (err)
    //         console.error('[FS error] ', err);
    // });

    return character;
}

// "Hello, this is (example) Mike ".replace(/ *\([^)]*\) */g, " ").trim();

//name: 'Al Super Gay', FamilleConnu: 4, EstEnfant: 4, EstHumain: 0, CheveuxChatain: 0, CheveuxBlond: 4, PorteAccessoireTete: 4, EstPersonnagePrincipal: 4, EnClasseDeCM1: 4, RapportAvecEcole: 4, ADesEnfants: 4, EstEnfantUnique: 2, PorteLunette: 4, EstUnGarcon: 0, OrigineAmericaine: 0, PossedePouvoir: 4, PorteHabitBleu: 0, RelationHomosexuelle: 0, CheveuxLong: 4, EstHandicape: 4, EstMechant: 4, PresentSaison1: 4

/*{
    "name": "Phillip \"Pip\" Pirrup",
    "url": "http://southparkstudios.mtvnimages.com/shared/characters/kids/nichole.png?height=165",
    "gender": "Female",
    "age": "Unknown; likely 30's", // "age": "8-10",
    "haircolor": "Black",
    "occupation": "Robber; Student",
    "grade": "4th Grade",
    "sexuality": "Pansexual",
    "grandmother": "Mabel Cartman",
    "grandfather": "Harold Cartman",
    "religion": "Roman Catholic, Blaintologist (formerly) Judaism (formerly)",
    "father": "Tom (Summer Sucks)",
    "mother": "Mrs. Turner (Mr. Hankey's Christmas Classics)",
    "boyfriend": "Token Black",
    "aunt": "Lisa Cartman",
    "uncle": "Howard Cartman",
    "girlfriend": "Heidi Turner",
    "firstappearance": "Cartman Finds Love"
}*/



/* */
// personnage = { gender: "male", age: "10", haircolor: "Black", occupation: "Student", grade:"4th Grade", sexuality: "", religion: "",
//  father: "", mother: "", brother: "", sister: "", uncle: "", aunt: "", grandfather: "", grandmother: "", boyfriend: "", girlfriend: "", husband: "", wife: "", owner: ""};

function scrapData() {
    console.log("scrap Data");
    let urls = getAllUrls();
    _.forEach(urls, function (url) {
        let character = getInfo(url);
        if (!_.isEmpty(character)) {
            console.log("\n", character);
            let text = JSON.stringify(character) + ',';
            fs.appendFile("E:/southpark.json", text, 'utf-8', function (err) {
                if (err)
                    console.error('[FS error] ', err);
            });
        }
    })
}

