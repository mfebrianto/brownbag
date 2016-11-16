var https = require( "https" );
var url = require( "url" );
var fs = require('fs');
var cookie;

console.log("start")


function readCookie() {
  var content =fs.readFileSync('cookies.txt', 'utf8', function (err,data) {
    if (err) {
      return console.log(err);
    }
  });

  return content;
}


function getOptions(path, method, cookie){
  var uname='su0I2qPWVZm1cu';
  var pword='3c2YfyW4r3QxvJK0eDMNYIWMD7O9OiasMMTh2jWtSO4FBrjAf4vrIQIsD9cP9Z95';

  var headers = {
    'Content-type': 'application/json',
    'Accept': 'application/json',
    'Authorization': 'Basic ' + new Buffer(uname + ':' + pword).toString('base64')
  };

  if (cookie != null && cookie != undefined){
    headers = Object.assign({'cookie': cookie},headers)
  }

  return {
    host: 'api.au.sumologic.com',
    port: '443',
    path: path,
    method: method,
    headers: headers
  };
}


function getFile(file) {
  if (file == null || file == undefined) {
    file = 'createSearchJob.json'
  }

  console.log(file);

  var content = fs.readFileSync(file, 'utf8', function (err,data) {
    if (err) {
      return console.log(err);
    }
  });

  return content;
}

function writeResult(data){
  fs.writeFileSync("result.json", data.toString());
}

function writeFile(res) {
  var cookie = res.headers['set-cookie'].toString();
  console.log(cookie);
  fs.writeFileSync("cookies.txt", cookie)
}

function getMetaData() {
  var queryId = JSON.parse(getFile('result.json'))['id'];

  var getReq = https.request(getOptions('/api/v1/search/jobs/'+queryId,'GET', readCookie()), function(res) {
    res.on('data', function (data) {
      console.log(data);
    });

  });
};

function getTheLogs() {
  var getReq = https.request(getOptions('/api/v1/search/jobs','POST'), function(res) {
    res.on('data', function (data) {
      writeFile(res);
      writeResult(data);
      getMetaData();
    });

    res.on('end', function(){
      console.log('end')
    });
  });

  getReq.write(getFile());
  getReq.end();

  return true;
};

getTheLogs();
