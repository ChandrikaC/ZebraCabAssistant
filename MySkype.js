/*-----------------------------------------------------------------------------

 Visit: https://github.com/Microsoft/BotBuilder/blob/master/Node/examples/

 This Bot uses the Bot Connector Service but is designed to showcase whats
 possible on Skype using the framework. The demo shows how to create a looping
 menu, use the built-in prompts, send Pictures, send Hero & Thumbnail Cards,
 send Receipts, and use Carousels.
 # RUN THE BOT:
 You can run the bot locally using the Bot Framework Emulator but for the best
 experience you should register a new bot on Skype and bind it to the demo
 bot. You can then run the bot locally using ngrok found at https://ngrok.com/.
 * Install and run ngrok in a console window using "ngrok http 3978".
 * Create a bot on https://dev.botframework.com and follow the steps to setup
 a Skype channel.
 * For the endpoint you setup on dev.botframework.com, copy the https link
 ngrok setup and set "<ngrok link>/api/messages" as your bots endpoint.
 * Next you need to configure your bots MICROSOFT_APP_ID, and
 MICROSOFT_APP_PASSWORD environment variables. If you're running VSCode you
 can add these variables to your the bots launch.json file. If you're not
 using VSCode you'll need to setup these variables in a console window.
 - MICROSOFT_APP_ID: This is the App ID assigned when you created your bot.
 - MICROSOFT_APP_PASSWORD: This was also assigned when you created your bot.
 * To use the bot you'll need to click the join link in the portal which will
 add it as a contact to your skype account.
 * To run the bot you can launch it from VSCode or run "node app.js" from a
 console window.
 -----------------------------------------------------------------------------*/

var restify = require('restify');
var builder = require('botbuilder');

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 7800, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat bot
var connector = new builder.ChatConnector({
    appId: 'c0cebf9c-eda6-41c5-8a95-42e8db840c53',//'9e4a2b07-2ccd-4e5d-bbc2-42abba66850d',
    appPassword: 'BeCPzKjMrMWq2V2PdwAisk2'//'VAGaf8F4FuSTxF7gryw9seh'
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());


var builder = require('botbuilder');

//var connector = new builder.ConsoleConnector().listen();
var bot = new builder.UniversalBot(connector);
bot.dialog('/', [
    function (session) {
        session.beginDialog('/ensureProfile');

    },
    function (session, results) {
        //session.dialogData.profile = results.response;
        session.send('Hello %s!', session.dialogData.profile.nm);

    }
]);
bot.dialog('/ensureProfile', [
    function (session) {
        builder.Prompts.text(session, 'Hi! What is your name?');
    },
    function (session, results) {
        if (results.response) {
            session.dialogData.profile.nm = results.response;
        }
        //session.endDialogWithResult({ response: session.dialogData.profile });

    }
]);

