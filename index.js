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

function writeResult(data){
  fs.writeFileSync("result.json", data.toString())
}

function writeFile(res) {
  var cookie = res.headers['set-cookie'].toString();
  console.log(cookie);
  fs.writeFileSync("cookies.txt", cookie)
}

function executeQuery(data){
  console.log("executeQuery");
  console.log(data.toString());
}

function getTheLogs() {
  console.log("inside the function");

  var uname='su0I2qPWVZm1cu';
  var pword='3c2YfyW4r3QxvJK0eDMNYIWMD7O9OiasMMTh2jWtSO4FBrjAf4vrIQIsD9cP9Z95';

  var options = {
    host: 'api.au.sumologic.com',
    port: '443',
    path: '/api/v1/search/jobs',
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Basic ' + new Buffer(uname + ':' + pword).toString('base64')
    }
  };

  console.log("searchJob");
  console.log(getFile());

  var getReq = https.request(options, function(res) {
    res.on('data', function (data) {
      writeFile(res);
      writeResult(data);
      executeQuery();
    });

    res.on('end', function(){
      console.log('end')
    });
  });

  getReq.write(getFile());
  getReq.end();

  return true;
};

function executeQuery(){
  console.log("executeQuery");
}

getTheLogs();
