// requires
var TelegramBot = require('node-telegram-bot-api');
var http = require('http');
var mathmode = require("mathmode");
var fs = require("fs");

//configs
var imports = ['amsmath', 'amssymb'];
var token = '';
var bot = new TelegramBot(token, {polling: true});

// comando /generate [blah]
bot.onText(/\/generate (.+)/, function (msg, match) {

    //criação da imagem latex
    var options = {dpi: 500, packages: imports};
    var timestamp = Date.now()+".jpg";
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
    var options = {format: "jpg", packages: imports, dpi: 1500};

    //criação da imagem latex
    var timestamp = Date.now()+".jpg";
    var imagefill = fs.createWriteStream(timestamp);
    var imgstream = mathmode(q_query, options);
    var piper = imgstream.pipe(imagefill);

    //ao terminar a criação
    piper.on("finish", function(){
        var results = [];
        var queryPic = {
            'type': 'photo', 
            'photo_url': timestamp,
            'thumb_url': timestamp,
            'id': timestamp,
            'photo_width': 48,
            'photo_height': 48
        };
        results.push(queryPic);
        bot.answerInlineQuery(q_id, results);
    });
});



//ligando servidor
http.createServer(function(req, res){
    res.end("Standby");
    bot.getUpdates();
}).listen(8666);