var https = require( "https" );
var url = require( "url" );
var fs = require('fs');
var cookie;

console.log("start")

function readCookie() {
  var content =fs.readFileSync('cookie.txt', 'utf8', function (err,data) {
    if (err) {
      return console.log(err);
    }
  });

  return content;
}

function getFile() {
  var content = fs.readFileSync('createSearchJob.json', 'utf8', function (err,data) {
    if (err) {
      return console.log(err);
    }
  });

  return content;
}

function executeQuery(data){
  console.log("executeQuery");
  console.log(data.toString());
}

function getTheCookie() {
  console.log("inside the function")

  var uname='su0I2qPWVZm1cu'
  var pword='3c2YfyW4r3QxvJK0eDMNYIWMD7O9OiasMMTh2jWtSO4FBrjAf4vrIQIsD9cP9Z95'

  console.log("searchJob")
  console.log(getFile())

  var getReq = https.request({
        host: 'api.au.sumologic.com',
	port: '443',
        path: '/api/v1/search/jobs',
	method: 'POST',
	headers: {
	  'Content-type': 'application/json',
	  'Accept': 'application/json',
	  'Authorization': 'Basic ' + new Buffer(uname + ':' + pword).toString('base64') 
	}
    }, function(res) {
       console.log("\nstatus code: ", res.statusCode);
       res.on('data', function(data) {
	 

	fs.writeFileSync("cookies.txt",data.headers["set-cookie"].toString(), function(err){
	   if(err) {
             console.log(err);
           }
	   console.log("The file was saved!");
	 });

//	 executeQuery(data);
       });

  });

  getReq.write(getFile())
  getReq.end();


}

getTheCookie();
console.log(cookie)
