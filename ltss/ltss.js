var fs = require("fs"),
    path = require("path");

var variables = {},
    mixins = {};

function extractVariables(source) {
  //var regex = /^(@[a-zA-Z0-9]+)[ \t]*:[ \t]*(["']?.*?["']?)[ \t]*;?$/g
  var regex = /(?:^|\n)(@[a-zA-Z0-9]+)[ \t]*:[ \t]*([^;\n]*);?/g;
  while (match = regex.exec(source)) {
    variables[match[1]] = match[2];
  }
  source = source.replace(regex, "");
  return source;
}

function extractMixins(source) {
  var regex = /(?:^|\n)([\w.#]*)[ \t]*\((.*?)\)[ \t]\{([\s\S]*?)\n\}/g;
  while (match = regex.exec(source)) {
    mixins[match[1]] = { 
      args: match[2].split(",").map(function(a) { 
        return a.trim().split(":").map(function(b) {
          return b.trim();
        });
      }), 
      content: match[3].trim()
    };
  }
  source = source.replace(regex, "");
  return source;
}

function replaceMixins(source) {
  var regex = /([\w.#]*)[ \t]*\((.*?)\)/g;
  while (match = regex.exec(source)) {
    var mixin = mixins[match[1]];
    var content = mixin.content;
    var args = match[2].split(",");
    var nonempty = match[2].trim().length > 0;
    mixin.args.forEach(function(a,idx) {
      content = content.replace(new RegExp(a[0], 'g'), idx>args.length -1 || !nonempty ? a[1] : args[idx]);
    });
    source = source.replace(match[0], content);
  }
  return source;
}

function injectIncludes(source, base_dir) {
  var regex = /@include[ \t]*\([ \t]*['"](.*?)['"][ \t]*\)[ \t]*;?/g;
  while (match = regex.exec(source)) {
    source = source.replace(regex, fs.readFileSync(path.join(base_dir, match[1] + ".ltss")));
  }
  return source;
}
exports.compileString = function(source, base_dir ,callback) {
  source = injectIncludes(source, base_dir);
  source = extractVariables(source);
  source = extractMixins(source);
  source = replaceMixins(source);
  for (var key in variables) {
    source = source.replace(new RegExp('' + key + '(?=[\W;]+)', 'g'), variables[key]);
  }
  
  callback(null, source.trim());
};

exports.compileFile = function(file, callback) {
  fs.readFile(file,{encoding: 'utf8'},  function(err, data) {
    exports.compileString(data.toString(), path.dirname(file), callback);
  });
}

exports.writeFile = function(source, target, callback) {
  exports.compileFile(source, function(err,data) {
    fs.writeFileSync(target,data);
    callback(err,target + " written");
  });
}
