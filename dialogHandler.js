/**
 * Created by dushyant on 28/7/16.
 */

var gdm = require('./gdmHandler');

module.exports.init=function(dialog,builder)
{
    // Add intent handlers
    dialog.matches('DeviceData', [
        function (session, args, next) {
            // Resolve and store any entities passed from LUIS.
            var device = session.dialogData.device = builder.EntityRecognizer.findEntity(args.entities, 'Device');
            console.log(device);

            if (!device) {
                var message = 'Sorry, unable to find this device, you need data for which of the following device?\n\n';
                gdm.listDevices(function (deviceList) {
                    builder.Prompts.text(session, message + deviceList);
                });

            }
            else {
                next();
            }
            /*var time = builder.EntityRecognizer.resolveTime(args.entities);
             var alarm = session.dialogData.alarm = {
             title: title ? title.entity : null,
             timestamp: time ? time.getTime() : null
             };

             // Prompt for title
             if (!alarm.title) {
             builder.Prompts.text(session, 'What would you like to call your alarm?');
             } else {
             next();
             }*/
        },
        function (session, results, next) {

            if (session.dialogData.device) {
                gdm.deviceData(session.dialogData.device ? session.dialogData.device.entity : results.response, function (result) {
                    if (validReply(result))
                    {
                        session.endDialog(result);

                    }
                    else
                        askAgain();
                });
            }
            else {
                gdm.deviceData(results.response, function (result) {
                    if (validReply(result))
                        session.send(result);
                    else
                        askAgain();
                });
            }
            function askAgain() {
                var message = 'Sorry, unable to find this device, you need data for which of the following device?\n\n';
                gdm.listDevices(function (deviceList) {
                    builder.Prompts.text(session, message + deviceList);
                });
            }
        },
        function (session, results) {
            gdm.deviceData(results.response, function (result) {
                if (validReply(result))
                    session.send(result);
                else
                    session.send("Device Not Found. Exiting...");
            });

        }
    ]);

    dialog.matches('Welcome', [
        function (session) {

            var welcomeMessage = 'Hi, hope you are doing well!';
            session.send(welcomeMessage);

        }
    ]);



    dialog.matches('DeviceStat', [
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
    ]);

    dialog.matches('Help', [
        function (session, args, next) {
            var skypeReply="You can ask the following things:\n\n";

            skypeReply+="Show me stats for *DEVICE NAME*\n\n";
            skypeReply+="Show me data for *DEVICE NAME*\n\n";
            skypeReply+="Show stats for GDM\n\n";
            skypeReply+="Send me stats for Gateway\n\n";
            session.send(skypeReply);
        }
    ]);

    dialog.onDefault(builder.DialogAction.send("I'm sorry I didn't understand. If you want to know all possibilities try asking for help!."));

    function validReply(result) {
        if(result === "DEVICE NOT FOUND")
            return false;
        else
            return true;
    }
}
