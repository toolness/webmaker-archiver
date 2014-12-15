var Make = require('makeapi-client');
var lazystream = require('lazystream');
var archiver = require('archiver');
var request = require('request');

var MakeStream = require('./make-stream');

function archive(username, format) {
  var archive = archiver.create(format);
  var basenames = {};

  var uniqueBasename = function(basename) {
    var candidate = basename;
    for (var i = 2; candidate in basenames; i++) {
      candidate = basename + '-' + i;
    }
    basenames[candidate] = true;
    return candidate;
  };

  var makeapi = new Make({
    apiURL: 'https://makeapi.webmaker.org/'
  });

  var stream = new MakeStream(makeapi, {
    user: username,
    contentType: "application/x-thimble"
  });

  stream.on('data', function(data) {
    var basename = data.url.split('/').slice(-1)[0];
    var createdAt = new Date(data.createdAt);
    basename = uniqueBasename(basename);
    archive.append(new lazystream.Readable(function(options) {
      return request(data.url + '_');
    }), {
      name: username + '/' + basename + '.html',
      date: createdAt
    });
  }).on('end', function() {
    archive.finalize();
  });

  return archive;
}

function main() {
  var USERNAME = process.argv[2];
  var FORMAT = 'zip';
  var filename = USERNAME + '.' + FORMAT;

  if (!USERNAME) {
    console.log("please specify a username.");
    process.exit(1);
  }

  console.log("writing " + filename + "...");
  archive(USERNAME, FORMAT)
    .pipe(require('fs').createWriteStream(filename))
    .on('close', function() {
      console.log('done.');
    });
}

exports.create = archive;

if (!module.parent) main();
