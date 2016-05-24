// requires
var TelegramBot = require('node-telegram-bot-api');
var http = require('http');
var mathmode = require("mathmode");
var fs = require("fs");

//configs
var options = {packages: ['amsmath', 'amssymb'], dpi: 500};
var token = '';
var bot = new TelegramBot(token, {polling: true});

// comando /generate [blah]
bot.onText(/\/generate (.+)/, function (msg, match) {

    //criação da imagem latex
    var timestamp = Date.now()+".png";
    var imagefill = fs.createWriteStream(timestamp);
    var imgstream = mathmode(match[1], options);
    var piper = imgstream.pipe(imagefill);

    //ao terminar a criação
    piper.on("finish", function(){

        //envio da imagem
        bot.sendPhoto(msg.from.id, timestamp).then(function(){

            //apaga-se o arquivo temporario
            fs.unlink(timestamp);
        });
    });
});

// comando /about
bot.onText(/\/about/, function (msg) {
    bot.sendMessage(msg.from.id, "LaTeXX Bot by Gustavo Silva\n"+
                                 "---------------------\n"+
                                 "IME-USP\n\nVersão 0.3");
});

//ligando servidor
http.createServer(function(req, res){
    res.end("Standby");
    bot.getUpdates();
}).listen(8666);