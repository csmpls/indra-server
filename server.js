
// i n d r a
//
// 		 s e r v e r
//

//   f f f f 
//             e n t e r   t h e   w i r e d                      (mit license 2014)

var _ = require('underscore')

var http = require('http'),
    fs = require('fs'),
    index = fs.readFileSync(__dirname + '/index.html');

var app = http.createServer(function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'})
    res.end(index)
});

//database
var Sequelize = require('sequelize')
  , sequelize = new Sequelize('DB_NAME', 'DB_USERNAME', 'DB_PASSWORD', 
	{port:5432, dialect: 'postgres',logging:false})
var pg = require('pg').native;

var Reading = sequelize.define('Reading', {
  username: Sequelize.STRING,
  start_time: Sequelize.DATE,
  end_time: Sequelize.DATE,
  reading: Sequelize.ARRAY(Sequelize.FLOAT),
}); Reading.sync()

http.createServer(function (request, response) {
  // get request sends server variables to client
  if(request.method == "GET") {
    response.writeHead(200, {"Content-Type": "application/json"})
    response.end(
        JSON.stringify({time:new Date()} )
    )
  } else if(request.method == "POST") { // post request contains biodata
    var requestBody = '';
    request.on('data', function(data) {
      requestBody += data;
      if(requestBody.length > 1e7) {
        response.end(JSON.stringify({error:'too large request'}))
      }
    });
    request.on('end', function() {
	saveBiodata(requestBody)
 	response.end()
    });
 }
}).listen(17664)


function saveBiodata(data) {

	var d = JSON.parse(data)

        var reading = Reading.create({
                username: 	d.username,
                start_time:     d.start_time,
                end_time:    	d.end_time,
		signal_quality: d.signal_quality,
                reading:  	d.raw_values,
        }) .error(function(err) {
                  console.log(err)
        }).success(function() {
                  console.log(d.username)
        });

}
