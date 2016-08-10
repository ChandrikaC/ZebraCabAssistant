/**
 * Created by Chandrikac on 4/7/16.
 */


var request = require('request').defaults({jar: true});
var zebraConfig=require('./config/Zebra.config');

function login(callback) {
    request({
        body: zebraConfig.auth,
        url: zebraConfig.host + 'api/v1.1/Account/Login',
        method: 'POST',
        json: true
    }, function (err, res) {
        if (err) {
            console.error(err);
            if (callback)
                callback(false);
        } else if (res.statusCode == 200) {
            cookie = res.headers['set-cookie'];
            if (callback)
                callback(true);
        } else {
            if (callback)
                callback(false);
        }

    })
}
function getCurrentLocationDetails(callback) {
    request.get('http://freegeoip.net/json/', function (err, data) {
        if (err)
            console.error(err);
        else {
            var body = JSON.parse(data.body);
            var skypeReply = "Total Devices: " + body.ip;
            skypeReply += "\n\nTotal Rows: " + body.country_code;
            skypeReply += "\n\nSynced Rows: " + body.country_name;
            skypeReply += "\n\nSynced Rows: " + body.region_code;
            skypeReply += "\n\nSynced Rows: " + body.region_name;
            skypeReply += "\n\nSynced Rows: " + body.city;
            skypeReply += "\n\nSynced Rows: " + body.zip_code;
            skypeReply += "\n\nSynced Rows: " + body.time_zone;
            skypeReply += "\n\nSynced Rows: " + body.latitude;
            skypeReply += "\n\nSynced Rows: " + body.longitude;

            if (callback)
                callback(skypeReply);
        }
    });
}
/*function listDevices(callback) {
    getDevicesFromHost(function (list) {
        if (!list) {
            if (callback)
                return callback(null);
            return;
        }
        var skypeReply = '';
        list.forEach(function (device) {
            skypeReply += device.name + '\n\n';
        });
        if (callback)
            callback(skypeReply);
    });
}
function deviceData(deviceName, callback) {
    getDevicesFromHost(function (list) {
        if (!list) {
            if (callback)
                return callback(null);
            return;
        }

        for (var i = 0; i < list.length; i++) {
            if (list[i].name.toLowerCase() == deviceName.toLowerCase()) {
                request.get(gdmConfig.host + '/api/dump/' + list[i]._id + '?limit=1', function (err, data) {
                    if (err) {
                        console.error(err);
                        return done(null);
                    }
                    else if (data.statusCode == 200) {
                        var body = JSON.parse(data.body);
                        var skypeReply;
                        if(body.length==0)
                            skypeReply="No Data for this device";
                        else
                            skypeReply= JSON.stringify(body, null, 4);
                        return done(skypeReply);
                    } else {
                        return done(null);
                    }
                });
                break;
            }
            else if (i == list.length - 1) {
                return done("DEVICE NOT FOUND");
            }
        }

        function done(val) {
            if (callback)
                callback(val);
        }
    });
}
function deviceInfo(deviceName, callback) {

    if(deviceName.toLowerCase().includes('gateway') || deviceName.toLowerCase().includes('gdm'))
    {
        gdmStats(callback);
    }
    else
    {
        getDevicesFromHost(function (list) {
            for(var i=0;i<list.length;i++)
            {
                var device=list[i];

                if (device.name.toLowerCase() == deviceName.toLowerCase()) {
                    var skypeReply = '';

                    skypeReply += "This device is " + (device.isOn ? "ON.\n\n" : "OFF.\n\n");

                    // ToDo: This device is [type] with [sensor] sensor on it
                    //skypeReply+="This device is "+device.type+" device";

                    if (device.syncStatus) {
                        var setMinutes = parseInt(device.syncTime.substring(2, 4));
                        var setHours;

                        // ToDo: Get sync option type
                        skypeReply += "Data is automatically synced ";

                        switch (device.syncFrequency) {
                            case "Real Time":
                                skypeReply += 'Realtime';
                                break;
                            case "Hourly":
                                setHours = parseInt(device.syncTime.substring(7, 9));
                                if (isNaN(setHours))  // Handle every n-minutes condition, hours=0
                                {
                                    setMinutes = parseInt(device.syncTime.substring(4, 6));
                                    setHours = 0;
                                }
                                skypeReply += " every " + setHours + " hours" + ", " + setMinutes + " minutes";
                                break;
                            case "Daily":
                                setHours = parseInt(device.syncTime.substring(5, 7));
                                skypeReply += " daily at " + setHours + " hours" + ", " + setMinutes + " minutes";
                        }
                        skypeReply += ".\n\n";

                        if (device.deleteAfterSync) {
                            skypeReply += "Data is deleted after it is synced.\n\n";
                        }

                    } else {
                        skypeReply += "Auto Sync is OFF.\n\n"
                    }
                    if (device.alertIsOn) {
                        // ToDo: Alert is triggered if it does not send data for n seconds
                        skypeReply += "Alert is triggered if it does not send data for " + device.dataFrequency + " seconds.\n\n"

                    }
                    done(skypeReply);
                    break;
                }
                else if (i == list.length - 1) {
                    return done("DEVICE NOT FOUND");
                }
            }


        });
    }

    function done(val) {
        if (callback)
            callback(val);
    }
}
function getDevicesFromHost(callback) {
    request.get(gdmConfig.host + '/api/devices', function (err, data) {
        if (err)
            console.error(err);
        else if (data.statusCode == 200) {
            var body = JSON.parse(data.body);

            if (callback)
                callback(body);
        } else {
            console.error(data.statusCode + " " + data.statusMessage);
            if (callback)
                callback(null)
        }
    });
}*/

module.exports={
    login:login,
    currentLocation:getCurrentLocationDetails
    /*stats:gdmStats,
    listDevices:listDevices,
    deviceData:deviceData,
    deviceInfo:deviceInfo*/
};