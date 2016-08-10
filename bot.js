/**
 * Created by sanket on 20/07/16.
 */
var fs=require('fs');
var restify = require('restify');
var builder = require('botbuilder');
var http = require('http');

var cookie;

var gdm = require('./gdmHandler');

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
//var serverOptions={
//    key: fs.readFileSync('server.key'),
//    certificate: fs.readFileSync('server.crt')
//};
var server = restify.createServer(/*serverOptions*/);
server.listen(process.env.port || process.env.PORT || 6000, function () {
    console.log('%s listening to %s', server.name, server.url);
});

var botConfig = require('./config/bot.config');

// Create chat bot
var connector = new builder.ChatConnector({
    appId: botConfig.appId,
    appPassword: botConfig.appPassword
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

/*var connector = new builder.ConsoleConnector().listen();
var bot = new builder.UniversalBot(connector);*/


//=========================================================
// Bots Dialogs
//=========================================================

// Create LUIS recognizer that points at our model and add it as the root '/' dialog for our Cortana Bot.
var recognizer = new builder.LuisRecognizer(botConfig.model);
var dialog = new builder.IntentDialog({recognizers: [recognizer]});
bot.dialog('/', dialog);

require('./dialogHandler').init(dialog,builder);

//***********

gdm.login(function (success) {

    if (success) {
         console.error("Login Successful!");
    }
    else {
        console.error("Could not login");
    }
});