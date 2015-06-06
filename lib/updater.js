var ref = require('scandal');
var fs = require('fs');
var esprima = require('../node_modules/esprima/esprima');
var estra = require('../node_modules/estraverse');
var path = require('path');

module.exports = {
  runUpdate: function(providerIn, mainRefIn) {
    linkProvider(providerIn);
    linkMainRef(mainRefIn);
    updateCompletions();
  }
};

var provider;
var mainRef;

var linkProvider = function(providerIn) {
  provider = providerIn;
};

var linkMainRef = function(mainRefIn) {
  mainRef = mainRefIn;
};

var search = ref.search;
var PathScanner = ref.PathScanner;
var PathSearcher = ref.PathSearcher;

var searchtext = /Polymer(\(|\s*\()({|\s*{)/gm;

var currentPath;
var numberAnalysed;
var numberToAnalyse;
var results;
var dictionary = {
  tags: {},
  attributes: {}
};

var updateCompletions = function() {
  var currentPaths = atom.project.getPaths() || [''];
  currentPath = currentPaths[0];

  var searcher = new PathSearcher();

  var scanner = new PathScanner(currentPath, {
    excludeVcsIgnores: true,

    // only search within js and html files
    inclusions: ['**.+(js|html)']
  });

  searcher.on('results-found', function(result) {
    results.push(result.filePath);
  }.bind(this));

  // Reset number values and dictionary
  numberToAnalyse = 0;
  numberAnalysed = 0;
  dictionary = {
    tags: {},
    attributes: {}
  };

  if (currentPath !== null && currentPath !== '') {
    results = [];
    search(searchtext, scanner, searcher, function() {
      searchDone();
    }.bind(this));
  }
};

// Don't include files which are within a folder named test or demo
var removeTestsDemos = function(results) {
  var answer = [];
  for (var i = 0, len = results.length; i < len; i++) {
    if (results[i]) {
      var dirArray = path.dirname(results[i].split(currentPath)[1]).split('/');
      var okay = true;
      for (var j = 0, lenJ = dirArray.length; j < lenJ; j++) {
        if (dirArray[j].toLowerCase() === 'test' || dirArray[j].toLowerCase() === 'demo') {
          okay = false;
        }
      }

      if (okay) {
        answer.push(results[i]);
      }
    }
  }

  return answer;
};

var searchDone = function() {
  if (results.length > 0) {
    results = removeTestsDemos(results);
    buildDictionary(results);
  }
};

// Extract the Polymer script from the html file
var htmlScriptExtract = function(content) {
  var regex = new RegExp(/<.*?dom-module.*?id="([^"]*?)".*?>/gi);
  var regName = new RegExp(/id="([^"]*?)"/ig);
  var domElement = content.match(regex);
  var nameResult = regName.exec(domElement);
  var name = null;
  if (nameResult) {
    if (nameResult[1]) {
      name = nameResult[1];
    }
  }

  var start = content.search(/<script>/ig) + 8;
  var end = content.search(/<\/script>/ig);
  var test = content.substring(start, end);
  while (test.search(searchtext) < 0) {
    content = content.slice(end + 9);
    start = content.search(/<script>/ig) + 8;
    end = content.search(/<\/script>/ig);
    test = content.substring(start, end);
  }

  return {
    script: test,
    htmlname: name
  };
};

var fileAnalyse = function(content, dictionary, esprima, htmlname) {
  numberAnalysed += 1;
  var syntaxTree;
  try {
    syntaxTree = esprima.parse(content);
  } catch (err) {}

  var polymerTree;
  var elementName;
  var elementProperties = [];

  if (syntaxTree) {
    estra.traverse(syntaxTree, {
      enter: function(node, parent) {
        if (node.type == 'CallExpression' && node.callee.name === 'Polymer') {
          polymerTree = node;
          return this.break;
        }
      }
    });

    if (polymerTree) {
      var polyProps;
      if (polymerTree.type === 'ExpressionStatement') {
        polyProps = polymerTree.expression.arguments[0].properties;
      } else if (polymerTree.type === 'CallExpression') {
        polyProps = polymerTree.arguments[0].properties;
      }

      for (var y = 0, lenY = polyProps.length; y < lenY; y++) {
        if (polyProps[y].key.name === 'is') {
          elementName = polyProps[y].value.value;
        }

        if (polyProps[y].key.name === 'properties') {
          var elProperties = polyProps[y].value.properties;
          for (var z = 0, lenZ = elProperties.length; z < lenZ; z++) {
            if (elProperties[z].key.name) {
              elementProperties.push(elProperties[z].key.name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase());
            }
          }
        }
      }
    }

    if (elementName) {
      if (elementProperties.length > 0) {
        dictionary.tags[elementName] = {
          attributes: elementProperties
        };
      } else {
        dictionary.tags[elementName] = {};
      }
    } else if (htmlname) {
      if (elementProperties.length > 0) {
        dictionary.tags[htmlname] = {
          attributes: elementProperties
        };
      } else {
        dictionary.tags[htmlname] = {};
      }
    } else {
      console.log('failed to correctly extract a Polymer element\'s information');
    }
  }

  if (numberAnalysed === numberToAnalyse) {
    if (currentPath !== null && currentPath !== '') {
      fs.writeFileSync(path.join(currentPath, '.ac-poly.json'), (JSON.stringify(dictionary, null, 0)) + '\n');
    }

    // Reload the newly updated completions file
    provider.loadCompletions();
    mainRef.updateDone();
  }
};

var fileAnalyseCallbacks = {
  htmlScriptExtract: htmlScriptExtract,
  fileAnalyse: fileAnalyse,
  dictionary: dictionary,
  esprima: esprima
};

var buildDictionary = function(results) {
  var len = results.length;
  numberToAnalyse = len;
  for (var i = 0; i < len; i++) {
    var filepath = results[i];
    if (path.extname(filepath).toLowerCase() === '.html') {
      fs.readFile(filepath, 'utf8', (function(_this) {
        return function(error, content) {
          if (error === null) {
            //var scriptContent = _this.htmlScriptExtract(content);
            var response = _this.htmlScriptExtract(content);
            _this.fileAnalyse(response.script, _this.dictionary, _this.esprima, response.htmlname);
          }
        };
      })(fileAnalyseCallbacks));
    } else {
      fs.readFile(filepath, 'utf8', (function(_this) {
        return function(error, content) {
          if (error === null) {
            _this.fileAnalyse(content, _this.dictionary, _this.esprima, null);
          }
        };
      })(fileAnalyseCallbacks));
    }
  }
};
