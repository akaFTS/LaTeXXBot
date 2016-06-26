// requires
var TelegramBot = require('node-telegram-bot-api');
var http = require('http');
var mathmode = require("mathmode");
var fs = require("fs");
var express = require('express');
var q = require("q");
var iss = require("image-size-stream");

//configs
var imports = ['amsmath', 'amssymb'];
var token = '202698795:AAFsEy64Un2KX5ItACRfOVHBmCDi8d94Ix4';
var bot = new TelegramBot(token, {polling: true});

//configs para servir as imagens no inline
var app = express();
app.use(express.static(__dirname + '/images'));
app.listen(80);

//logging
var winston = require('winston');
winston.add(winston.transports.File, { filename: 'history.log' });
winston.remove(winston.transports.Console);



// comando /generate [blah]
bot.onText(/\/generate (.+)/, function (msg, match) {

    //criação da imagem latex
    var options = {dpi: 500, packages: imports};
    var timestamp = Date.now()+".png";
    var imagefill = fs.createWriteStream("images/"+timestamp);
    var imgstream = mathmode(match[1], options);

    //tratamento de erro na compilação do latex
    var isOk = true;
    imgstream.on("error", function(err){
        isOk = false;
    });

    var piper = imgstream.pipe(imagefill);

    //ao terminar a criação
    piper.on("finish", function(){

        //envia-se a foto se não houve erro
        q.fcall(function(){
            if(isOk)
                return bot.sendPhoto(msg.from.id, "images/"+timestamp);
            else
                return false;
        }).then(function(){

            //apaga-se o arquivo temporario
            fs.unlink("images/"+timestamp);

            //armazena-se o log
            winston.info('Direct bot used: '+msg.from.username);

        });
    });
});

// comando /about
bot.onText(/\/about/, function (msg) {
    bot.sendMessage(msg.from.id, "LaTeXX Bot by Gustavo Silva\n"+
                                 "---------------------\n"+
                                 "IME-USP - Version 1.3");
});

// comando /start
bot.onText(/\/start/, function (msg) {
    bot.sendMessage(msg.from.id, "/generate [text] - Generate image from LaTeX code\n"+
                                 "/about - About the bot\n"+
                                 "/like - Like it? Rate and Spread!\n"+
                                 "@latexxbot [text] - Inline version of the bot");
});

// comando /like
bot.onText(/\/like/, function (msg) {
    bot.sendMessage(msg.from.id, "Like this bot?\n🌟🌟🌟🌟🌟\n Give it 5 stars on StoreBot: https://storebot.me/bot/latexxbot\n\n"+
                                 "Also, spread the word to your friends! 👍");
});

//inline
bot.on('inline_query', function(msg)
{
    if (msg.query == "") return;

    //criação da imagem latex
    var options = {format: "jpeg", packages: imports, dpi:1000};
    var timestamp = Date.now()+".jpeg";
    var imagefill = fs.createWriteStream("images/"+timestamp);
    var imgstream = mathmode(msg.query, options);
    var sizestream = iss();

    //tratamento de erro na compilação do latex
    var isOk = true;
    imgstream.on("error", function(err){
        isOk = false;
    });

    //manipulação do tamanho do thumb
    var width = 200;
    sizestream.on("size", function(dim){
        width = parseInt(100*(dim.width/dim.height));
    });
    sizestream.on("error", function(err){
        isOk = false;
    });

    var piper = imgstream.pipe(sizestream).pipe(imagefill);

    //ao terminar a criação
    piper.on("finish", function(){

        //envia-se a foto se não houve erro
        q.fcall(function(){
            if(isOk) {
                //cria-se o array com o resultado
                var results = [];
                var queryPic = {
                    'type': 'photo', 
                    'thumb_url': 'http://latexxbot.noip.me/'+timestamp,
                    'photo_url': 'http://latexxbot.noip.me/'+timestamp,
                    'id': timestamp,
                    'photo_width': width,
                    'photo_height': 100,
                    'title': "LaTeX"
                };

                //logging
                winston.info('Inline bot used: '+msg.from.username);

                //responde-se a query
                results.push(queryPic); 
                return bot.answerInlineQuery(msg.id, results);
            }
            else
                return false;
        });



        
    });
});


//ligando servidor
http.createServer(function(req, res){
    res.end("Standby");
    bot.getUpdates();
}).listen(8666, "0.0.0.0");
