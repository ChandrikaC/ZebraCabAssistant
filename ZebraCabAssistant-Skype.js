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
//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 7893, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat bot
var connector = new builder.ChatConnector({
    appId: botConfig.appId,//'9e4a2b07-2ccd-4e5d-bbc2-42abba66850d',
    appPassword: botConfig.appPassword//'VAGaf8F4FuSTxF7gryw9seh'
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

//Create LUIS
var recognizer = new builder.LuisRecognizer(botConfig.model);



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
bot.beginDialogAction('help', '/help', { matches: /^help/i });
bot.beginDialogAction('menu', '/menu', { matches: /^menu/i });

//=========================================================
// Bots Dialogs
//=========================================================
/*var intents = new builder.IntentDialog({ recognizers: [recognizer] });
bot.dialog('/', intents);*/
//var geoLocator = require('geolocator');
var mailSender = require('nodemailer');
var randomString = require('randomstring');
var validator = require('validator');
var geoCoder = require('node-geocoder');

bot.dialog('/', [
    function (session) {
        /*// Send a greeting and show help.
            var card = new builder.HeroCard(session)
                .title("Welcome to Zebra Cab Assistant!!")
                .images([
                    builder.CardImage.create(session, "https://lh5.googleusercontent.com/-SeXFN3LiTCo/AAAAAAAAAAI/AAAAAAAAABA/Vk7GvwaQ-J4/s0-c-k-no-ns/photo.jpg")
                ]);
            var msg = new builder.Message(session).attachments([card]);
            session.send(msg);
            session.send("Please type 'help' to see help options!");*/
          /*  geoLocator.geolocator.config({
                language: "en",
                google: {
                    version: "3",
                    key: "AIzaSyCSa0jR1leITr7qvYHzdkcMkt2JUHMnDXQ"
                }
            });*/

            /*geoLocator.geolocator.getIP(function (err, result) {
                console.log(err || result);
            });*/
            /*if(!session.userName) {
                session.beginDialog('/askName');
            }
            else {
                next();
            }*/


            session.beginDialog('/ensureProfile',session.userData.profile);

/*
if(!session.OTPString)
    session.OTPString = randomString.generate({
            length: 6,
            charset: 'numeric'
        });

        builder.Prompts.text("Please enter your email address?")

       // session.send("Create transporter");
        // create reusable transporter object using the default SMTP transport
        var transporter = mailSender.createTransport('smtps://winjitchand%40gmail.com:Chandrika11@smtp.gmail.com');

      //  session.send("Setup email");
        // setup e-mail data with unicode symbols
        var mailOptions = {
            from: '"Zebra Cab Support" <chandrika.chetty@gmail.com>', // sender address
            to: 'chandrikac@winjit.com', // list of receivers
            subject: 'Zebra Cab OTP', // Subject line
            text: randomOTP.toString(), // plaintext body
            html: '<b>' + randomOTP.toString() + '</b>' // html body
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                session.send(error.toString());
                return console.log(error);

            }
            console.log('Message sent: ' + info.response);
           // session.send("Email sent");
        });
        //OTP code sent to registered email
*/

    },
    function (session, results) {
        session.userData.profile = results.response;
        //session.send("Verified");
        session.send('Hello %(name)s!\n\nYour profile has been confirmed!!\n\nHow may I help you?\n\nPlease type help to see help options', session.userData.profile);

    }
]);

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
                session.dialogData.profile.emailid = results.response;
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
                        builder.Prompts.text(session, "Please enter OTP sent to your registered email Address?");
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
/*
bot.dialog('/ensureEmailAddress',[
    function (session) {
    if(!session.userData.profile.emailid)
        dialog.Prompts.text(session, "May I know your registered email Address?");

    }
])*/
bot.dialog('/menu', [
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

bot.dialog('/help', [
    function (session) {
        session.send("Global commands that are available anytime:\n\n* menu - Exits a demo and returns to the menu.\n* goodbye - End this conversation.\n* help - Displays these commands.");
    }
]);

bot.dialog('/CabBooking',[

    function (session,results) {

            session.userData.BookingDetails = {};
            builder.Prompts.text(session, "Where you are heading?");
    },
    function (session, results, next) {
        if (results.response) {
            session.userData.BookingDetails.Place = results.response;
            builder.Prompts.time(session, "What time would you like to book the cab?");
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
            session.send('The cab has been book to %s at %d/%d/%d %d:%02d%s',CabPlace,
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
/*bot.dialog('/prompts', [
    function (session) {
        session.send("Our Bot Builder SDK has a rich set of built-in prompts that simplify asking the user a series of questions. This demo will walk you through using each prompt. Just follow the prompts and you can quit at any time by saying 'cancel'.");
        builder.Prompts.text(session, "Prompts.text()\n\nEnter some text and I'll say it back.");
    },
    function (session, results) {
        session.send("You entered '%s'", results.response);
        builder.Prompts.number(session, "Prompts.number()\n\nNow enter a number.");
    },
    function (session, results) {
        session.send("You entered '%s'", results.response);
        session.send("Bot Builder includes a rich choice() prompt that lets you offer a user a list choices to pick from. On Facebook these choices by default surface using buttons if there are 3 or less choices. If there are more than 3 choices a numbered list will be used but you can specify the exact type of list to show using the ListStyle property.");
        builder.Prompts.choice(session, "Prompts.choice()\n\nChoose a list style (the default is auto.)", "auto|inline|list|button|none");
    },
    function (session, results) {
        var style = builder.ListStyle[results.response.entity];
        builder.Prompts.choice(session, "Prompts.choice()\n\nNow pick an option.", "option A|option B|option C", { listStyle: style });
    },
    function (session, results) {
        session.send("You chose '%s'", results.response.entity);
        builder.Prompts.confirm(session, "Prompts.confirm()\n\nSimple yes/no questions are possible. Answer yes or no now.");
    },
    function (session, results) {
        session.send("You chose '%s'", results.response ? 'yes' : 'no');
        builder.Prompts.time(session, "Prompts.time()\n\nThe framework can recognize a range of times expressed as natural language. Enter a time like 'Monday at 7am' and I'll show you the JSON we return.");
    },
    function (session, results) {
        session.send("Recognized Entity: %s", JSON.stringify(results.response));
        builder.Prompts.attachment(session, "Prompts.attachment()\n\nYour bot can wait on the user to upload an image or video. Send me an image and I'll send it back to you.");
    },
    function (session, results) {
        var msg = new builder.Message(session)
            .ntext("I got %d attachment.", "I got %d attachments.", results.response.length);
        results.response.forEach(function (attachment) {
            msg.addAttachment(attachment);
        });
        session.endDialog(msg);
    }
]);

bot.dialog('/picture', [
    function (session) {
        session.send("You can easily send pictures to a user...");
        var msg = new builder.Message(session)
            .attachments([{
                contentType: "image/jpeg",
                contentUrl: "http://www.theoldrobots.com/images62/Bender-18.JPG"
            }]);
        session.endDialog(msg);
    }
]);

bot.dialog('/cards', [
    function (session) {
        session.send("You can use Hero & Thumbnail cards to send the user a visually rich information...");

        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                new builder.HeroCard(session)
                    .title("Hero Card")
                    .subtitle("Space Needle")
                    .text("The <b>Space Needle</b> is an observation tower in Seattle, Washington, a landmark of the Pacific Northwest, and an icon of Seattle.")
                    .images([
                        builder.CardImage.create(session, "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Seattlenighttimequeenanne.jpg/320px-Seattlenighttimequeenanne.jpg")
                    ])
                    .tap(builder.CardAction.openUrl(session, "https://en.wikipedia.org/wiki/Space_Needle"))
            ]);
        session.send(msg);

        msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                new builder.ThumbnailCard(session)
                    .title("Thumbnail Card")
                    .subtitle("Pikes Place Market")
                    .text("<b>Pike Place Market</b> is a public market overlooking the Elliott Bay waterfront in Seattle, Washington, United States.")
                    .images([
                        builder.CardImage.create(session, "https://upload.wikimedia.org/wikipedia/en/thumb/2/2a/PikePlaceMarket.jpg/320px-PikePlaceMarket.jpg")
                    ])
                    .tap(builder.CardAction.openUrl(session, "https://en.wikipedia.org/wiki/Pike_Place_Market"))
            ]);
        session.endDialog(msg);
    }
]);

bot.dialog('/list', [
    function (session) {
        session.send("You can send the user a list of cards...");

        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                new builder.HeroCard(session)
                    .title("Hero Card")
                    .subtitle("Space Needle")
                    .text("The <b>Space Needle</b> is an observation tower in Seattle, Washington, a landmark of the Pacific Northwest, and an icon of Seattle.")
                    .images([
                        builder.CardImage.create(session, "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Seattlenighttimequeenanne.jpg/320px-Seattlenighttimequeenanne.jpg")
                    ]),
                new builder.ThumbnailCard(session)
                    .title("Thumbnail Card")
                    .subtitle("Pikes Place Market")
                    .text("<b>Pike Place Market</b> is a public market overlooking the Elliott Bay waterfront in Seattle, Washington, United States.")
                    .images([
                        builder.CardImage.create(session, "https://upload.wikimedia.org/wikipedia/en/thumb/2/2a/PikePlaceMarket.jpg/320px-PikePlaceMarket.jpg")
                    ])
            ]);
        session.endDialog(msg);
    }
]);

bot.dialog('/carousel', [
    function (session) {
        session.send("You can pass a custom message to Prompts.choice() that will present the user with a carousel of cards to select from. Each card can even support multiple actions.");

        // Ask the user to select an item from a carousel.
        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachmentLayout(builder.AttachmentLayout.carousel)
            .attachments([
                new builder.HeroCard(session)
                    .title("Space Needle")
                    .text("The <b>Space Needle</b> is an observation tower in Seattle, Washington, a landmark of the Pacific Northwest, and an icon of Seattle.")
                    .images([
                        builder.CardImage.create(session, "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Seattlenighttimequeenanne.jpg/320px-Seattlenighttimequeenanne.jpg")
                            .tap(builder.CardAction.showImage(session, "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Seattlenighttimequeenanne.jpg/800px-Seattlenighttimequeenanne.jpg")),
                    ])
                    .buttons([
                        builder.CardAction.openUrl(session, "https://en.wikipedia.org/wiki/Space_Needle", "Wikipedia"),
                        builder.CardAction.imBack(session, "select:100", "Select")
                    ]),
                new builder.HeroCard(session)
                    .title("Pikes Place Market")
                    .text("<b>Pike Place Market</b> is a public market overlooking the Elliott Bay waterfront in Seattle, Washington, United States.")
                    .images([
                        builder.CardImage.create(session, "https://upload.wikimedia.org/wikipedia/en/thumb/2/2a/PikePlaceMarket.jpg/320px-PikePlaceMarket.jpg")
                            .tap(builder.CardAction.showImage(session, "https://upload.wikimedia.org/wikipedia/en/thumb/2/2a/PikePlaceMarket.jpg/800px-PikePlaceMarket.jpg")),
                    ])
                    .buttons([
                        builder.CardAction.openUrl(session, "https://en.wikipedia.org/wiki/Pike_Place_Market", "Wikipedia"),
                        builder.CardAction.imBack(session, "select:101", "Select")
                    ]),
                new builder.HeroCard(session)
                    .title("EMP Museum")
                    .text("<b>EMP Musem</b> is a leading-edge nonprofit museum, dedicated to the ideas and risk-taking that fuel contemporary popular culture.")
                    .images([
                        builder.CardImage.create(session, "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Night_Exterior_EMP.jpg/320px-Night_Exterior_EMP.jpg")
                            .tap(builder.CardAction.showImage(session, "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Night_Exterior_EMP.jpg/800px-Night_Exterior_EMP.jpg"))
                    ])
                    .buttons([
                        builder.CardAction.openUrl(session, "https://en.wikipedia.org/wiki/EMP_Museum", "Wikipedia"),
                        builder.CardAction.imBack(session, "select:102", "Select")
                    ])
            ]);
        builder.Prompts.choice(session, msg, "select:100|select:101|select:102");
    },
    function (session, results) {
        var action, item;
        var kvPair = results.response.entity.split(':');
        switch (kvPair[0]) {
            case 'select':
                action = 'selected';
                break;
        }
        switch (kvPair[1]) {
            case '100':
                item = "the <b>Space Needle</b>";
                break;
            case '101':
                item = "<b>Pikes Place Market</b>";
                break;
            case '101':
                item = "the <b>EMP Museum</b>";
                break;
        }
        session.endDialog('You %s "%s"', action, item);
    }
]);

bot.dialog('/receipt', [
    function (session) {
        session.send("You can send a receipts for purchased good with both images and without...");

        // Send a receipt with images
        var msg = new builder.Message(session)
            .attachments([
                new builder.ReceiptCard(session)
                    .title("Recipient's Name")
                    .items([
                        builder.ReceiptItem.create(session, "$22.00", "EMP Museum").image(builder.CardImage.create(session, "https://upload.wikimedia.org/wikipedia/commons/a/a0/Night_Exterior_EMP.jpg")),
                        builder.ReceiptItem.create(session, "$22.00", "Space Needle").image(builder.CardImage.create(session, "https://upload.wikimedia.org/wikipedia/commons/7/7c/Seattlenighttimequeenanne.jpg"))
                    ])
                    .facts([
                        builder.Fact.create(session, "1234567898", "Order Number"),
                        builder.Fact.create(session, "VISA 4076", "Payment Method"),
                        builder.Fact.create(session, "WILLCALL", "Delivery Method")
                    ])
                    .tax("$4.40")
                    .total("$48.40")
            ]);
        session.send(msg);

        // Send a receipt without images
        msg = new builder.Message(session)
            .attachments([
                new builder.ReceiptCard(session)
                    .title("Recipient's Name")
                    .items([
                        builder.ReceiptItem.create(session, "$22.00", "EMP Museum"),
                        builder.ReceiptItem.create(session, "$22.00", "Space Needle")
                    ])
                    .facts([
                        builder.Fact.create(session, "1234567898", "Order Number"),
                        builder.Fact.create(session, "VISA 4076", "Payment Method"),
                        builder.Fact.create(session, "WILLCALL", "Delivery Method")
                    ])
                    .tax("$4.40")
                    .total("$48.40")
            ]);
        session.endDialog(msg);
    }
]);

bot.dialog('/signin', [
    function (session) {
        // Send a signin
        var msg = new builder.Message(session)
            .attachments([
                new builder.SigninCard(session)
                    .title("You must first signin to your account.")
                    .button("signin", "http://example.com/")
            ]);
        session.endDialog(msg);
    }
]);


bot.dialog('/actions', [
    function (session) {
        session.send("Bots can register global actions, like the 'help' & 'goodbye' actions, that can respond to user input at any time. You can even bind actions to buttons on a card.");

        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                new builder.HeroCard(session)
                    .title("Hero Card")
                    .subtitle("Space Needle")
                    .text("The Space Needle is an observation tower in Seattle, Washington, a landmark of the Pacific Northwest, and an icon of Seattle.")
                    .images([
                        builder.CardImage.create(session, "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Seattlenighttimequeenanne.jpg/320px-Seattlenighttimequeenanne.jpg")
                    ])
                    .buttons([
                        builder.CardAction.dialogAction(session, "weather", "Seattle, WA", "Current Weather")
                    ])
            ]);
        session.send(msg);

        session.endDialog("The 'Current Weather' button on the card above can be pressed at any time regardless of where the user is in the conversation with the bot. The bot can even show the weather after the conversation has ended.");
    }
]);

// Create a dialog and bind it to a global action
bot.dialog('/weather', [
    function (session, args) {
        session.endDialog("The weather in %s is 71 degrees and raining.", args.data);
    }
]);
bot.beginDialogAction('weather', '/weather');   // <-- no 'matches' option means this can only be triggered by a button.
*/