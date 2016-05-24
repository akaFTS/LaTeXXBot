// requires
var TelegramBot = require('node-telegram-bot-api');
var http = require('http');
var mathmode = require("mathmode");
var fs = require("fs");
var express = require('express');

//configs
var imports = ['amsmath', 'amssymb'];
var token = '202698795:AAFsEy64Un2KX5ItACRfOVHBmCDi8d94Ix4';
var bot = new TelegramBot(token, {polling: true});
var app = express();
app.use(express.static(__dirname + '/images'));
app.listen(80);



// comando /generate [blah]
bot.onText(/\/generate (.+)/, function (msg, match) {

    //criação da imagem latex
    var options = {dpi: 500, packages: imports};
    var timestamp = Date.now()+".png";
    var imagefill = fs.createWriteStream("images/"+timestamp);
    var imgstream = mathmode(match[1], options);
    var piper = imgstream.pipe(imagefill);

    //ao terminar a criação
    piper.on("finish", function(){

        //envio da imagem
        bot.sendPhoto(msg.from.id, "images/"+timestamp).then(function(){

            //apaga-se o arquivo temporario
            fs.unlink("images/"+timestamp);
        });
    });
});

// comando /about
bot.onText(/\/about/, function (msg) {
    bot.sendMessage(msg.from.id, "LaTeXX Bot by Gustavo Silva\n"+
                                 "---------------------\n"+
                                 "IME-USP\n\nVersão 0.3");
});

// comando /start
bot.onText(/\/start/, function (msg) {
    bot.sendMessage(msg.from.id, "/generate [text] - Generate image from LaTeX code\n"+
                                 "/about - About the bot\n"+
                                 "@latexxbot [text] - Inline version of the bot");
});

//inline
bot.on('inline_query', function(msg)
{
    var q_id = msg.id;
    var q_query = msg.query;
    if (q_query == "") return;
    var options = {format: "jpeg", packages: imports, dpi:1000};

    //criação da imagem latex
    var timestamp = Date.now()+".jpeg";
    var imagefill = fs.createWriteStream("images/"+timestamp);
    var imgstream = mathmode(q_query, options);
    var piper = imgstream.pipe(imagefill);

    //ao terminar a criação
    piper.on("finish", function(){
        var results = [];
        var queryPic = {
            'type': 'photo', 
            'thumb_url': 'http://latexxbot.noip.me/'+timestamp,
            'photo_url': 'http://latexxbot.noip.me/'+timestamp,
            'id': timestamp,
            'photo_width': 200,
            'photo_height': 80,
            'title': "LaTeX"
        };
        results.push(queryPic); 
        bot.answerInlineQuery(q_id, results);
    });
});

//ligando servidor
http.createServer(function(req, res){
    res.end("Standby");
    bot.getUpdates();
}).listen(8666, "0.0.0.0");
