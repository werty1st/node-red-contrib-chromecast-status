var chromecast = require("./index");


module.exports = function(RED) {


    function LowerCaseNode(config) {
    
        RED.nodes.createNode(this,config);
        var node = this;

        setInterval(()=>{

            var msg = {};
            var ip = config.ip;

            chromecast(ip).then(deviceStatus => {
                if (deviceStatus) {
                    msg.payload = deviceStatus;
                    node.send(msg);            
                } else {
                    node.send({});
                }
            });

        },3000);
    }

    RED.nodes.registerType("chromecast-status",LowerCaseNode);
}