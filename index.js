var express = require('express');
var app     = express();
var server  = app.listen(8002, function() {
    var host = server.address().address;
    var port = server.address().port;
    
    console.log('Tracker listening on http://%s:%s', host, port);
});

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

app.get('/save', function(req, res) {
    //var a = save(req.query);
    console.log('here');
    res.send('saving: ');
    io.emit('saved', 0.5);
});
