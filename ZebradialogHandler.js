/**
 * Created by ChandrikaC on 04/07/16.
 */

var zebraAPI = require('./ZebraAPIHandler');



module.exports.init=function(luisDialog,builder)
{

    //luisDialog.onBegin([]);

    luisDialog.matches('cabbooking',[

        function (session,args,next) {
            session.userData.BookingDetails = {};
            /*session.userData.BookingDetails.FromPlace  = builder.EntityRecognizer.findEntity(args.entities, 'from').entity;*/
            if(builder.EntityRecognizer.findEntity(args.entities,'to'))
                session.userData.BookingDetails.ToPlace  = builder.EntityRecognizer.findEntity(args.entities, 'to').entity;


            console.log(session.userData.BookingDetails.ToPlace);
            if(!session.userData.BookingDetails.ToPlace){
                //getMyLocation();
                builder.Prompts.text(session, "Okay...May I know about your destination please?");
            }
            else{
                next();
            }
            function getMyLocation() {
                zebraAPI.currentLocation(function(results){session.send(results)});
            }

        },
        function (session, results, next) {
            console.log(session.userData.BookingDetails.CabTime);
            if(!session.userData.BookingDetails.CabTime) {
                if (!session.userData.BookingDetails.ToPlace) {
                    builder.Prompts.time(session, "Thanks... May I ask at what time you want your ride?");
                }
                if (session.userData.BookingDetails.ToPlace) {
                    builder.Prompts.time(session, "Okay... May I ask at what time you want your ride?");
                }
                else {
                    next();
                }
            }
            else{
                next();
            }

        },
        function (session, results) {
            //if(!session.userData.BookingDetails.CabTime) {
                if (results.response) {
                    session.userData.BookingDetails.CabTime = builder.EntityRecognizer.resolveTime([results.response]);
                }
           /* }
            else{
                session.userData.BookingDetails.CabTime = builder.EntityRecognizer.resolveTime([session.userData.BookingDetails.CabTime]);
            }*/


            // Return to cab booking to passenger
            if (session.userData.BookingDetails.ToPlace && session.userData.BookingDetails.CabTime) {
                var CabPlace = session.userData.BookingDetails.ToPlace.toString();
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

    /*dialog.matches('FindNearestCabs',[

        function (session) {

            session.send("Your nearest cabs are!!");
        }
    ]);*/

    luisDialog.matches('greetings', [
        function (session) {
            if(session.userData.name && session.userData.emailid) {
                var welcomeMessage = "Hi, hope you are doing well!\n\nThis is your Zebra Cabs Assistant.\n\nHow may I help you?";

                session.send(welcomeMessage);
            }
            else {
                session.beginDialog('/ensureProfile',session.userData.profile);
            }
        },

        function (session, results) {
            session.userData.profile = results.response;
            //session.send("Verified");
            session.send('Hello %(name)s!\n\nYour profile has been confirmed!!\n\nHow may I help you?\n\nPlease type \'help\' to see options', session.userData.profile);

        }
    ]);

    /*dialog.matches('DeviceStat', [
        function (session, args, next) {
            var device = session.dialogData.device = builder.EntityRecognizer.findEntity(args.entities, 'Device');
            console.log(device);

            if (!device) {
                var message = 'Sorry, unable to find this device, you need stats for which of the following device?\n\n';
                gdm.listDevices(function (deviceList) {
                    builder.Prompts.text(session, message + deviceList);
                });

            }
            else {
                next();
            }
        },
        function (session, results, next) {

            if (session.dialogData.device) {
                gdm.deviceInfo(session.dialogData.device ? session.dialogData.device.entity : results.response, function (result) {
                    if (validReply(result))
                    {
                        session.endDialog(result);

                    }
                    else
                        askAgain();
                });
            }
            else {
                gdm.deviceInfo(results.response, function (result) {
                    if (validReply(result))
                        session.send(result);
                    else
                        askAgain();
                });
            }
            function askAgain() {
                var message = 'Sorry, unable to find this device, you need stats for which of the following device?\n\n';
                gdm.listDevices(function (deviceList) {
                    builder.Prompts.text(session, message + deviceList);
                });
            }
        },
        function (session, results) {
            gdm.deviceInfo(results.response, function (result) {
                if (validReply(result))
                    session.send(result);
                else
                    session.send("Device Not Found. Exiting...");
            });

        }
    ]);*/

    luisDialog.matches('userhelp','/help');

    luisDialog.matches('Gratitude', [
        function (session) {
            session.send("Your are welcome!!!");
        }
    ]);

    luisDialog.onDefault(builder.DialogAction.send("I'm sorry I didn't understand. If you want to know all possibilities try asking for help!."));


}
