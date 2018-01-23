var Client = require('castv2').Client;

var currentRequestId = 1;
var networkTimeout = 2000;



function getNewRequestId(){
	if(currentRequestId > 9998){
		currentRequestId=1;
		//console.log("Rest currentRequestId");
	}
	//console.log("getNewRequestId: "+(currentRequestId+1))
	return currentRequestId++;
}

function closeClientConnection(client, connection) {
	closeConnection(connection);
	closeClient(client);
}

function closeConnection(connection) {
	//console.log('closing connection');
	try {
		connection.send({ type: 'CLOSE' });
	} catch (e) {
		handleException(e);
	}
}

function closeClient(client) {
	//console.log('closing client');
	try {
		client.close();
	} catch (e) {
		handleException(e);
	}
}

function parseAddress(address){
	ip=address.split(':')[0];
	port=address.split(':')[1];

	if (!port) {
		port = 8009;
	}

	//console.log('IP: '+ip+' port: '+port);

	return {
      host: ip,
      port: port
    };
}

function handleException(e) {
	console.error('Exception caught: ' + e);
}

function getDeviceStatus(address) {
    return new Promise(resolve => {
      var deviceStatus, connection, receiver, exception;
      var client = new Client();
      var corrRequestId = getNewRequestId();

      try {
          //console.log('getDeviceStatus addr: %a', address);
           client.connect(parseAddress(address), function() {
              connection = client.createChannel('sender-0', 'receiver-0', 'urn:x-cast:com.google.cast.tp.connection', 'JSON');
              receiver   = client.createChannel('sender-0', 'receiver-0', 'urn:x-cast:com.google.cast.receiver', 'JSON');

              connection.send({ type: 'CONNECT' });
              receiver.send({ type: 'GET_STATUS', requestId: corrRequestId });
              
              receiver.on('message', function(data, broadcast) {
                    if(data.type == 'RECEIVER_STATUS') {
                        if (data.requestId==corrRequestId) {
                            deviceStatus = data;
                            //console.log('getDeviceStatus recv: %s', JSON.stringify(deviceStatus));
                            //resolve(JSON.stringify(deviceStatus));
                            resolve(deviceStatus);
                        }
                   }
                 });
            });
            client.on('error', function(err) {
               handleException(err);
               closeClientConnection(client, connection);
               resolve(null);
          });
      } catch (e) {
          handleException(e);
          closeClientConnection(client, connection);
          resolve(null);
      }

      setTimeout(() => {
          closeClientConnection(client, connection);
          resolve(null);
        }, networkTimeout);
  });
}

/* getDeviceStatus("192.168.81.20").then(deviceStatus => {
    if (deviceStatus) {
        //console.log(deviceStatus);

    } else {
        //console.log("no status");
    }
}); */


module.exports = getDeviceStatus;