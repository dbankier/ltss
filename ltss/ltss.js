var fs = require("fs"),
    path = require("path");

var variables = {},
    mixins = {};

function UnknownMixinException(message) {
   this.message = message;
   this.name = "UnknownMixinException";
}

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
  var regex = /([\w.#]*)[ \t]*\((.*?)\)/;
  while (match = regex.exec(source)) {
    var mixin = mixins[match[1]];

    if (undefined === mixin) {
      throw new UnknownMixinException('Could not find mixin named "' + match[1] + '"');
    } else {
      var content = mixin.content;
      var args = match[2].split(",");
      var nonempty = match[2].trim().length > 0;
      mixin.args.forEach(function(a,idx) {
        content = content.replace(new RegExp(a[0], 'g'), idx>args.length -1 || !nonempty ? a[1] : args[idx]);
      });
      source = source.replace(match[0], content);
    }
  }
  return source;
}

function replaceI18n(source) {
  var regex = /L[ \t]*\((.*?)\)/;
  while (match = regex.exec(source)) {
    var content = '__L__' + match[1] + '__L__';
    source = source.replace(match[0], content);
  }
  return source;
}

function resetI18n(source) {
  var regex = /__L__([ \t]*.*?)__L__/;
  while (match = regex.exec(source)) {
    var content = 'L(' + match[1] + ')';
    source = source.replace(match[0], content);
  }
  return source;
}

function replaceVariables(source) {
  var regex = /(@[\w]+)(?=[\W;,^:]+)(?![\(:])/;
  while (match = regex.exec(source)) {
    var name = match[1];
    var content = variables[name];
    source = source.replace(match[0], content);
  }
  return source;
}

function injectIncludes(source, base_dir) {
  var regex = /@include[ \t]*\([ \t]*['"](.*?)['"][ \t]*\)[ \t]*;?/;
  while (match = regex.exec(source)) {
    source = source.replace(match[0], fs.readFileSync(path.join(base_dir, match[1] + ".ltss")));
  }
  return source;
}

exports.compileString = function(source, base_dir ,callback) {
  //reset state
  variables = {}; mixins = {};

  source = injectIncludes(source, base_dir);
  source = extractVariables(source);
  source = extractMixins(source);
  source = replaceI18n(source);
  source = replaceMixins(source);
  source = resetI18n(source);
  source = replaceVariables(source);

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
