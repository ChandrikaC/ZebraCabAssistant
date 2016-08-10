/**
 * Created by dushyant on 28/7/16.
 */


var request = require('request').defaults({jar: true});
var gdmConfig=require('./config/gdm.config');

function login(callback) {
    request({
        body: gdmConfig.auth,
        url: gdmConfig.host + '/auth/signin',
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
function gdmStats(callback) {
    request.get(gdmConfig.host + '/api/stats', function (err, data) {
        if (err)
            console.error(err);
        else {
            var body = JSON.parse(data.body);
            var skypeReply = "Total Devices: " + body.deviceCount;
            skypeReply += "\n\nTotal Rows: " + body.localStreamCount;
            skypeReply += "\n\nSynced Rows: " + body.cloudStreamCount;
            skypeReply += "\n\nData size: " + (Math.round(body.database.dataSize/1024/1024*100)/100) +" MB";
            skypeReply += "\n\nCompressed Data Size: " + (Math.round(body.database.storageSize/1024/1024*100)/100)+" MB";
            if (callback)
                callback(skypeReply);
        }
    });
}
function listDevices(callback) {
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
}

module.exports={
    login:login,
    stats:gdmStats,
    listDevices:listDevices,
    deviceData:deviceData,
    deviceInfo:deviceInfo
};