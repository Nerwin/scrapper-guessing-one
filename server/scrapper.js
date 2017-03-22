
import { HTTP } from 'meteor/http';
import Future from 'fibers/future';
var fs = require('fs');
var util = require('util');

var index = 0;


getDefinition = function (word) {


    word.type = word.type.replace(/ *\([^)]*\) */g, " ").trim();

    HTTP.get(word.url, {}, function (err, resp) {
        if (err)
            throw err;

        let $ = cheerio.load(resp.content);
        let word = {};

        $('tr').each(function (i, elem) {
            $('td', this).each(function (i, elem) {
                if (i === 1) {
                    word.name = $(this).text()
                    var abalise = $(this).find('a');
                    if (abalise != 'undefined') {
                        word.url = abalise.attr('href');
                    }
                }
                if (i === 4)
                    word.type = $(this).text();
            });

            // let text = JSON.stringify(word) + ',';
            // fs.appendFile("E:/englishWords.json", text, 'utf-8', function (err) {
            //     if (err)
            //         console.error('[FS error] ', err);
            // });
        });

        console.log("=> ", word);
    });

}

getWords = function () {
    var future = new Future;
    let url = 'http://www.talkenglish.com/vocabulary/top-2000-vocabulary.aspx';
    listOfWords = [];

    HTTP.get(url, {}, function (err, resp) {
        if (err)
            throw err;

        let $ = cheerio.load(resp.content);
        let word = {};

        $('tr').each(function (i, elem) {
            $('td', this).each(function (i, elem) {
                if (i === 1) {
                    word.name = $(this).text()
                    var abalise = $(this).find('a');
                    if (abalise != 'undefined') {
                        word.url = abalise.attr('href');
                    }
                }
                if (i === 4)
                    word.type = $(this).text();
            });
            //listOfWords.push(word);
            let text = JSON.stringify(word) + ',';
            fs.appendFile("E:/englishWords.json", text, 'utf-8', function (err) {
                console.log(text);
                index++;
                if (err)
                    console.error('[FS error] ', err);
            });
        });
        //future.return(listOfWords);
    });
    console.log(index);
    //return future.wait();
    return listOfWords;
}

getAllUrls = function () {
    listOfUrl = [];
    listOfUrl = getUrls();
    return listOfUrl;
}


function getUrls() {
    var future = new Future;
    let url = 'http://wiki.southpark.cc.com/wiki/List_of_Characters';
    listOfUrl = [];

    HTTP.get(url, {}, function (err, resp) {
        if (err)
            throw err;
        //let url = "http://wiki.southpark.cc.com/";
        var stop = false;
        let $ = cheerio.load(resp.content);
        $('#mw-content-text .character').each(function (index) {
            $(this).find('a').each(function (index, element) {
                let description = element['attribs']['href'];
                if (description.includes("/wiki/") && stop == false)
                    listOfUrl.push(description);
                if (description.includes("Mrs._Stoley"))
                    stop = true;
            })
        })
        future.return(listOfUrl);
    });
    return future.wait();
}

getInfo = function (url) {

    var attributes = ['Gender', 'Age', 'Hair Color', 'Occupation', 'Grade', 'Sexuality', 'Religion', 'Father', 'Mother', 'Brother', 'Sister', 'Uncle', 'Aunt', 'Grandfather', 'Grandmother', 'Boyfriend', 'Girlfriend', 'Son', 'Daughter', 'Husband', 'Wife', 'First Appearance', 'Owner'];
    var future = new Future;
    let baseUrl = 'http://wiki.southpark.cc.com';
    var character = {};

    HTTP.get(baseUrl + url, {}, function (err, resp) {
        if (err) {
            console.log("[Error] No page found");
        } else {
            let $ = cheerio.load(resp.content);

            let name = $('#mw-content-text .info-box .padding .info-box-header').text();
            character.name = name;

            let imageUrl = $('#mw-content-text .info-box .padding .image img').attr('src');
            character.url = imageUrl;

            $('#mw-content-text .info-box .padding .table').find('tr').each(function (index, element) {
                var key = $('.key', this).text();
                var value = $('.value', this).text();
                if (_.contains(attributes, key))
                    character[key.replace(/\s/g, '').toLowerCase()] = value;
            });
        }
        future.return(character);
    })
    return future.wait();
}