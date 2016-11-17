const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const https = require( "https" );
var queryId;
var cookie;


function messagesOnTextFormat(jsonMessages){
  var regex = /"_raw":".*?"/g;
  var result = jsonMessages.toString().match(regex);
//   var file = "app.log";
  var logStream;

  for(var i = 0; i < result.length;i++){
    // logStream = fs.createWriteStream(file, {'flags': 'a'});
    // logStream.write(result[i]+"\n");
    console.log(result[i]+"\n");
  }
//   logStream.end('this is the end line');
}

function getMessages(){
  console.log("getMessages");
  console.log(queryId);
  console.log(cookie);

  var url = '/api/v1/search/jobs/'+ queryId +'/messages?offset=0&limit=100';

  var getReq = https.request(getOptions(url, 'GET', cookie), function(res) {
    res.on('data', function (data) {
      messagesOnTextFormat(data.toString());
    });

    res.on('done', function (data) {

    });
  });

  getReq.end();

}


function getOptions(path, method, cookie){
  var uname='su0I2qPWVZm1cu';
  var pword='3c2YfyW4r3QxvJK0eDMNYIWMD7O9OiasMMTh2jWtSO4FBrjAf4vrIQIsD9cP9Z95';

  var headers = {
    'Content-type': 'application/json',
    'Accept': 'application/json',
    'Authorization': 'Basic ' + new Buffer(uname + ':' + pword).toString('base64')
  };

  if (cookie !== null && cookie !== undefined){
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

function writeResult(data){
  createFileOnS3("result.json", data.toString());
}

function writeFile(res) {
  var cookie = res.headers['set-cookie'].toString();
  console.log(cookie);
  createFileOnS3("cookies.txt", cookie);
}

/*
 * recursive command
 */
function getMetaData() {

  var params = {Bucket: 'sumolog', Key: 'result.json'};
  var cookie_params = {Bucket: 'sumolog', Key: 'cookies.txt'};

  s3.getObject(params, function(err, data) {
    if (err) console.log(err, err.stack);
    if (!err) {
      result = data.Body.toString('utf8');
      console.log(result);

      s3.getObject(cookie_params, function(err_cookie, data_coookie) {
        if (err) console.log(err_cookie, err_cookie.stack);
        if (!err) {
          cookie = data_coookie.Body.toString('utf8');
          queryId = JSON.parse(result)['id'];
          console.log('query_id : '+queryId);

          var getReq = https.request(getOptions('/api/v1/search/jobs/'+queryId,'GET', cookie), function(res) {
            res.on('data', function (data) {
              var val = JSON.parse(data.toString())['state'];
              console.log(val);

              if (val == 'GATHERING RESULTS'){
                getMetaData();
              } else {
                getMessages();
              }
            });
          });

          getReq.end();
        }
      });

    }
  });



}

function getTheLogs() {

  var params = {Bucket: 'sumolog', Key: 'createSearchJob.json'};

  //read from s3
  s3.getObject(params, function(err, data) {
    if (err) console.log(err, err.stack);
    if (!err) {
      createSearchJobContent = data.Body.toString('utf8');
      console.log(createSearchJobContent);

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

      getReq.write(createSearchJobContent);
      getReq.end();
    }
  });
}

function createFileOnS3(key, body){
  var param = {Bucket: 'sumolog', Key: key, Body: body};

  s3.upload(param, function(err, data) {
    if (err) console.log(err, err.stack);   // an error occurred
    else console.log(data);                 // successful response
    // context.done();
  });

  console.log('file created');
}

exports.handler = (event, context, callback) => {

  var https = require( "https" );
  var url = require( "url" );
  var fs = require('fs');
  var cookie;

  console.log("start");
  getTheLogs();
  console.log("end");
};