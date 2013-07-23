var fs = require("fs");

var variables = {},
    mixins = {};

function extractVariables(source) {
  //var regex = /^(@[a-zA-Z0-9]+)[ \t]*:[ \t]*(["']?.*?["']?)[ \t]*;?$/g
  var regex = /(?:^|\n)(@\w+)[ \t]*:[ \t]*([^;\n]*);?/g
  var match = regex.exec(source) 
  while (match != null) {
    variables[match[1]] = match[2];
    match = regex.exec(source);
  }
  source = source.replace(regex, "");
  return source;
}

function extractMixins(source) {
  var regex = /(?:^|\n)([\w.#]*)[ \t]*\((.*?)\)[ \t]{([\s\S]*?)\n}/g
  var match = regex.exec(source) 
  while (match != null) {
    mixins[match[1]] = { 
      args: match[2].split(",").map(function(a) { 
        return a.trim().split(":").map(function(b) {
          return b.trim();
        });
      }), 
      content: match[3]
    };
    match = regex.exec(source);
  }
  source = source.replace(regex, "");
  return source;
}

function replaceMixins(source) {
  var regex = /([\w.#]*)[ \t]*\((.*?)\)/g
  var match = regex.exec(source) 
  while (match != null) {
    var mixin = mixins[match[1]];
    var content = mixin.content;
    var args = match[2].split(",");
    var nonempty = match[2].trim().length > 0;
    mixin.args.forEach(function(a,idx) {
      content = content.replace(new RegExp(a[0], 'g'), idx>args.length -1 || !nonempty ? a[1] : args[idx]);
    });
    source = source.replace(match[0], content);
    match = regex.exec(source);
  }
  return source;

}
exports.compileString = function(source,callback) {
  source = extractVariables(source);
  source = extractMixins(source);
  for (var key in variables) {
    source = source.replace(new RegExp(key, 'g'), variables[key]);
  }
  source = replaceMixins(source);
  callback(null, source);
};

exports.compileFile = function(file, callback) {
  fs.readFile(file,{encoding: 'utf8'},  function(err, data) {
    exports.compileString(data.toString(),callback);
  });
}

exports.writeFile = function(source, target, callback) {
  exports.compileFile(source, function(err,data) {
    fs.writeFileSync(target,data);
    callback(err,target + " written");
  });
}
