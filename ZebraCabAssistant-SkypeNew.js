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
var botConfig = require('./Config/bot.config');
var mailSender = require('nodemailer');
var randomString = require('randomstring');
var validator = require('validator');

var ZebraAPI = require('./ZebraAPIHandler');
//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 7894, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat bot
var connector = new builder.ChatConnector({
    appId: botConfig.appId,//'9e4a2b07-2ccd-4e5d-bbc2-42abba66850d',
    appPassword: botConfig.appPassword//'VAGaf8F4FuSTxF7gryw9seh'
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());


//=========================================================
// Activity Events
//=========================================================

bot.on('conversationUpdate', function (message) {
    // Check for group conversations
    if (message.address.conversation.isGroup) {
        // Send a hello message when bot is added
        if (message.membersAdded) {
            message.membersAdded.forEach(function (identity) {
                if (identity.id === message.address.bot.id) {
                    var reply = new builder.Message()
                        .address(message.address)
                        .text("Hello everyone!");
                    bot.send(reply);
                }
            });
        }

        // Send a goodbye message when bot is removed
        if (message.membersRemoved) {
            message.membersRemoved.forEach(function (identity) {
                if (identity.id === message.address.bot.id) {
                    var reply = new builder.Message()
                        .address(message.address)
                        .text("Goodbye");
                    bot.send(reply);
                }
            });
        }
    }
});

bot.on('contactRelationUpdate', function (message) {
    if (message.action === 'add') {
        var name = message.user ? message.user.name : null;
        var reply = new builder.Message()
            .address(message.address)
            .text("Hello %s... Thanks for adding me. Say 'hello' to see some great demos.", name || 'there');
        bot.send(reply);
    } else {
        // delete their data
    }
});

bot.on('typing', function (message) {
    // User is typing
});

bot.on('deleteUserData', function (message) {
    // User asked to delete their data
    delete session.userData.profile.name;
    delete session.userData.profile.emailid;

});


//=========================================================
// Bots Middleware
//=========================================================

// Anytime the major version is incremented any existing conversations will be restarted.
bot.use(builder.Middleware.dialogVersion({ version: 1.0, resetCommand: /^reset/i }));

//=========================================================
// Bots Global Actions
//=========================================================

bot.endConversationAction('goodbye', 'Goodbye :)', { matches: /^goodbye/i });
//bot.beginDialogAction('help', '/help', { matches: /^help/i });
bot.beginDialogAction('menu', '/menu', { matches: /^menu/i });

//=========================================================
// Bots Dialogs
//=========================================================

// Create LUIS recognizer that points at our model and add it as the root '/' dialog for our Cortana Bot.
var recognizer = new builder.LuisRecognizer(botConfig.model);
var luisDialog = new builder.IntentDialog({recognizers: [recognizer]});
bot.dialog('/', luisDialog);


require('./ZebradialogHandler').init(luisDialog,builder,bot);



ZebraAPI.login(function (success) {

    if (success) {
        console.error("Login Successful!");
    }
    else {
        console.error("Could not login");
    }
});

/*
bot.dialog('/', [
    function (session,next) {
        if(!session.userName) {
            session.beginDialog('/askName');
        }
        else {
            next();
        }

    },
    function (session, results) {
        session.userName = results.response;
        session.send('Hello %s!\n\nHow may I help you?\n\nPlease type help to see help options', session.userName);
    }
]);

bot.dialog('/askName', [
    function (session) {
        if(!session.userName)
            builder.Prompts.text(session, "Hi! May I know your name?");
    },
    function (session, results) {
        //session.userName = results.response;
        //session.endDialogWithResult(results);
        if (results.response) {
            session.userName = results.response;
        }
        session.endDialogWithResult({ response: session.userName });

    }
]);
*/
bot.dialog('/ensureProfile', [
    function (session, args, next) {
        session.dialogData.profile = args || {};
        console.log(session.dialogData.profile.name);
        if (!session.dialogData.profile.name) {
            builder.Prompts.text(session, "May I know your name?");
        } else {
            next();
        }
    },
    function (session, results) {
        if (results.response) {
            session.dialogData.profile.name = results.response;
        }
        if (!session.dialogData.profile.emailid) {
            builder.Prompts.text(session, "May I know your registered email Address?");
        } else {
            session.endDialogWithResult({response: session.dialogData.profile});
        }
    },

    function(session,results,next) {
        if (results.response) {
            {
                session.dialogData.profile.emailid ='<a href="mailto:chandrikac@winjit.com">chandrikac@winjit.com</a>';
                //session.dialogData.profile.emailid = results.response.body;
                //console.log(session.dialogData.profile.emailid.);
                if (validator.isEmail(session.dialogData.profile.emailid)) {
                    session.dialogData.profile.otpstring = randomString.generate({
                        length: 6,
                        charset: 'numeric'
                    });

                    // create reusable transporter object using the default SMTP transport
                    var transporter = mailSender.createTransport('smtps://winjitchand%40gmail.com:Chandrika11@smtp.gmail.com');

                    // setup e-mail data with unicode symbols
                    var mailOptions = {
                        from: '"Zebra Cab Support" <winjitchand@gmail.com>', // sender address
                        to: session.dialogData.profile.emailid.toString(), // list of receivers
                        subject: 'Zebra Cab OTP', // Subject line
                        text: session.dialogData.profile.otpstring.toString(), // plaintext body
                        html: '<b>' + session.dialogData.profile.otpstring.toString() + '</b>' // html body
                    };

                    // send mail with defined transport object
                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            session.send(error.toString());
                            return console.log(error);

                        }
                        console.log('Message sent: ' + info.response);
                        builder.Prompts.text(session, "Please enter OTP sent to your registered email Address:");
                    });
                }
                else {
                    askEmailAddressAgain();
                }

                function askEmailAddressAgain() {
                    builder.Prompts.text("Please enter valid email address.");
                }
            }
        }
    },
    function(session,results){
        if(results.response) {
            //compare OTP entered by user and OTP sent on registered email address
            session.send("Sent OTP %s", session.dialogData.profile.otpstring);
            session.send("entered OTP %s",results.response);
            if ( session.dialogData.profile.otpstring.toString() === results.response.toString()) {
                session.endDialogWithResult({response: session.dialogData.profile});
            }
            else {
                //session.dialogData.profile.IsConfirmed = false;
                askOTPAgain();
                session.endDialogWithResult({
                    resumed: builder.ResumeReason.notCompleted
                });
            }
            function askOTPAgain() {
                dialog.Prompts.text(session,"Incorrect OTP!! enter correct OTP.")
            }
        }
    }
]);

bot.dialog('/help', [
    function (session) {
        //builder.Prompts.choice(session, "What demo would you like to run?", "Book a ride|Find Nearest Cabs|(quit)");
        var style = builder.ListStyle.button;
        builder.Prompts.choice(session, "Please select your service from below options", "Book a ride|Find Nearest Cabs|Quit", { listStyle: style });
    },
    function (session, results) {
        if (results.response && results.response.entity != 'Quit') {
            // Launch demo dialog

            if(results.response.entity.toString() == 'Book a ride') {
                session.beginDialog('/CabBooking');
            }
            else if(results.response.entity.toString() == 'Find Nearest Cabs'){
                session.beginDialog('/FindNearestCabs');
            }
        } else {
            // Exit the menu
            session.endDialog();
        }
    }
]).reloadAction('reloadMenu', null, { matches: /^menu|show menu/i });

bot.dialog('/CabBooking',[

    function (session,results) {

        session.userData.BookingDetails = {};
        builder.Prompts.text(session, "Please tell me your destination?");
    },
    function (session, results, next) {
        if (results.response) {
            session.userData.BookingDetails.Place = results.response;
            builder.Prompts.time(session, "what time you want your ride?");
        }
        else {
            next();
        }
    },
    function (session, results) {
        if (results.response) {
            session.userData.BookingDetails.CabTime = builder.EntityRecognizer.resolveTime([results.response]);
        }

        // Return to cab booking to passenger
        if (session.userData.BookingDetails.Place && session.userData.BookingDetails.CabTime) {
            var CabPlace = session.userData.BookingDetails.Place.toString();
            var CabArrivingTime = session.userData.BookingDetails.CabTime;
            var isAM = CabArrivingTime.getHours() < 12;
            session.send('The ride has been book to %s at %d/%d/%d %d:%02d%s',CabPlace,
                CabArrivingTime.getMonth() + 1, CabArrivingTime.getDate(), CabArrivingTime.getFullYear(),
                isAM ? CabArrivingTime.getHours() : CabArrivingTime.getHours() - 12, CabArrivingTime.getMinutes(), isAM ? 'am' : 'pm');
            session.endDialog();

        } else {
            session.endDialogWithResult({
                resumed: builder.ResumeReason.notCompleted
            });
        }
    }
]);
/*
bot.dialog('/FindNearestCabs',[

    function (session,results) {

        session.dialogData.BookingDetails = {};
        builder.Prompts.text(session, "Where you are heading?");

        //next();


    },
    function (session, results, next) {
        if (results.response) {
            session.dialogData.BookingDetails.Place = results.response;
            builder.Prompts.time(session, "What time would you like to book the cab?");
        }
        else {
            next();
        }
    },
    function (session, results) {
        if (results.response) {
            session.dialogData.BookingDetails.CabTime = builder.EntityRecognizer.resolveTime([results.response]);
        }

        // Return cab booking to passenger
        if (session.dialogData.BookingDetails.Place && session.dialogData.BookingDetails.CabTime) {
            session.endDialogWithResult({ response: session.dialogData.BookingDetails });

        } else {
            session.endDialogWithResult({
                resumed: builder.ResumeReason.notCompleted
            });
        }
    }
]);

    */