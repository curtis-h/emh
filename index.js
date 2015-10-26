express = require('express');
var app     = express();
var server  = app.listen(8002, function() {
    var host = server.address().address;
    var port = server.address().port;
    
    console.log('Tracker listening on http://%s:%s', host, port);
});

var request = require('request');
var fs      = require('fs');

var MongoClient = require('mongodb').MongoClient;
var ObjectId    = require('mongodb').ObjectID;

var db = function(callback) {
    MongoClient.connect('mongodb://localhost:27017/tracker', function(err, database) {
        if(!err)
            console.log("Connected correctly to server.");
        
        return callback(database);
    });
}

var save = function(data) {
    console.log('save', data);
    return db(function(database) {
        console.log('save?', data);
        if(!data._id) {
            data._id = ObjectId().toString();
            
            database.collection('tracker').insertOne(data, function(err, result) {
                console.log('result', err);
                if(!err) {
                    console.log('saved cat', result.ops[0]);
                    //io.emit('saved', result.ops[0]);
                    return true;
                }
                
                database.close();
            });
        }
        else {
            // update
            
        }
    });
};


app.use(express.static(__dirname + '/public'));



//*
var io = require('socket.io')(server);
io.on('connection', function(socket) {
    var cats = [];

    socket.on('save', function(data) {
        console.log('save');
        console.log(data);
        
        if(!data._id) {
            data._id = ObjectId().toString();
            
            db.collection('categories').insertOne(data, function(err, result) {
                console.log('result', err);
                if(!err) {
                    console.log('saved cat', result.ops[0]);
                    io.emit('saved', result.ops[0]);
                }
            });
        }
        else {
            var id = {'_id' : data._id};
            delete(data._id);
            
            console.log('delete id');
            console.log(data);
            
            db.collection('categories').updateOne(id,
                {$set: data},
                function(err, results) {
                    console.log(results);
                }
            );
            
        }
    });
    
});
//*/

var count = 0;
var avg = false;

app.get('/save', function(req, res) {
    //var a = save(req.query);
    var value = req.query.value;
    value = parseInt(value);
    if(count == 5) {
        io.emit('saved', avg / 5);
        avg = 0;
        count = 0;
    }
    else {
        avg += value;
        count++;
    }
    console.log('here', req.query.value);
    res.send('saving: ');
    
});

app.get('/test', function(req, res) {
    var url = 'https://api.projectoxford.ai/face/v0/detections?analyzesAge=1&analyzesGender=1';
    
    var formData = {
        // Pass a simple key-value pair
        my_field: 'my_value',
        // Pass data via Buffers
        my_buffer: new Buffer([1, 2, 3]),
        // Pass data via Streams
        my_file: fs.createReadStream(__dirname + '/unicycle.jpg'),
        // Pass multiple values /w an Array
        attachments: [
          fs.createReadStream(__dirname + '/attachment1.jpg'),
          fs.createReadStream(__dirname + '/attachment2.jpg')
        ],
        // Pass optional meta-data with an 'options' object with style: {value: DATA, options: OPTIONS}
        // Use case: for some types of streams, you'll need to provide "file"-related information manually.
        // See the `form-data` README for more information about options: https://github.com/felixge/node-form-data
        custom_file: {
          value:  fs.createReadStream('/dev/urandom'),
          options: {
            filename: 'topsecret.jpg',
            contentType: 'image/jpg'
          }
        }
      };
      request.post({url:'http://service.com/upload', formData: formData}, function optionalCallback(err, httpResponse, body) {
        if (err) {
          return console.error('upload failed:', err);
        }
        console.log('Upload successful!  Server responded with:', body);
      });
    
    fs.createReadStream('curtis1.jpg').pipe(request.post(url)).on('response', function(response) {
        console.log(response.statusCode);
    });
});
