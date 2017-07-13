var lineReader = require('readline').createInterface({
  input: require('fs').createReadStream('history.log')
});

var users = [];

lineReader.on('line', function (line) {
    var obj = JSON.parse(line);
    var message = obj.message;
    var nome = /.+[:][ ](.*)/.exec(message)[1];    
    if (users.indexOf(nome) == -1) users.push(nome);
});

lineReader.on('close', function() {
    users.forEach(function(user){
        console.log(user);
    });
    console.log();
    console.log("TOTAL: "+users.length+" USERS");
});
