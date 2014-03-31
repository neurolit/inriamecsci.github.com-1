/** Encapsulates some interaction with https://github.com.
 * 
 * It provides a simplified interface with the [https://github.com API](http://developer.github.com/v3).
 * 
 * It allows to encapsulate both remote and local commands to initialize or synchronize a working-directory.
 * 
 *####Usage
 *
 * It uses the [node-github](http://ajaxorg.github.io/node-github) module, to be installed using:
 *``` 
 * sudo npm install -g github
 *``` 
 * The [source file](./GithubApi.js.zip) is to be used in node.js sources, via a construct of the form:
 *``` javascript 
 *	var fm = require("./GithubApi.js");
 *	fm.login("me"); // for example
 *```
 * @namespace
 * @version 0.0.1 (Sun, 15 Sep 2013 13:31:32 GMT)
 * @copyright <a href='http://www.cecill.info/licences/Licence_CeCILL-C_V1-en.html'>CeCILL-C</a>
 * @author vthierry <thierry.vieville@inria.fr>
 */
var GithubApi = module.exports = function() {
  // Loads the required nodejs modules
  var githubAPI = require("github"), fs = require("fs"), exec = require("child_process").exec;
  /** The github API interface. 
   * 
   * This allows us to access all [github API functions](http://ajaxorg.github.io/node-github).
   */
  var api = new githubAPI({
    version: "3.0.0"
  });
  /** Logins to the github server.
   * @param {string} username The user name.
   * @param {string} [password=undefined] The user password. If not provided, the password is input via stdin.
   * @memberof GithubApi
   */
  var login = function(username, password) {
    user = username;
    if (password == undefined) {
      inputPassword(function(password) {
        login(username, password);
      });
    } else {
      api.authenticate({
        type: "basic",
        username: username,
        password: password
      });
    }
  };
  // The present user
  var user;
  /** Initializes a repository with a default set of source files.
   * @param {string} name The repository name.
   * @param {string} [org=name] The repository organisation.
   * @param {string} [description=name/org] The respositoty description.
   * @param {string} [directory=./name] The local directory where to clone the repository.
   * @param {object} files The local directory initial files, an object of the form `{ filepath : filebody }`.
   * @param {function=} next  Function called when the operation is completed.
   * @memberof GithubApi
   */
  var createRepo = function(name, org, description, directory, files, next) {
    description = description == undefined ? name + org : description;
    org = org == undefined ? user : org;
    directory = directory == undefined ? "./" + name : directory;
    files = files == undefined ? {} : files;
    if (files["README.md"] == undefined) {
      files["README.md"] = org + " : " + name + "\n========================\n" + description;
    }
    var callback = function(error, result) {
      if (error) {
        console.log("Request error " + error);
      } else {
        mkdirs(directory);
        for (var file in files) {
          mkdirs(directory + "/" + file, true);
          if (!fs.existsSync(directory + "/" + file)) {
            fs.writeFileSync(directory + "/" + file, files[file]);
          }
        }
        gitRun(directory, [ "init", "add *", 'commit -m "first commit"', "remote add origin git@github.com:" + org + "/" + name + ".git", "push -u origin master" ], next);
      }
    };
    if (org == user) {
      api.repos.create({
        name: name,
        description: description
      }, callback);
    } else {
      api.repos.createFromOrg({
        org: org,
        name: name,
        description: description
      }, callback);
    }
  };
  /** Synchronizes a working directory with the remote bundle.
   * 
   * It simply concatenates a `pull ; commit ; push` git command sequence.
   * 
   * @param {string} [directory=.] The local directory where to clone the repository.
   * @param {int=1} delay Delay in second.
   * @param {string} [message="commited from GithubApi"] The commit message.
   * @param {function=} next  Function called when the operation is completed.
   * @memberof GithubApi
   */
  var gitSync = function(directory, delay, message, next) {
    message = message == undefined ? "commited from GithubApi" : message;
    gitRun(directory, delay, [ "pull -q", 'commit -a -m "' + message + '"', "push" ], next);
  };
  /** Runs a sequence of git commands in a given directory.
   * @param {string} [directory=.] The working directory.
   * @param {int=1} delay Delay in second.
   * @param {array} commands  The git commands, e.g. `[ "status", "add *" ]`, thus without the "git" prefix.
   * @param {function=} next Function called when the operation is completed.
   * @memberof GithubApi
   */
  var gitRun = function(directory, delay, commands, next) {
    directory = directory == undefined ? "." : directory;
    for (var i = 0; i < commands.length; i++) {
      commands[i] = "cd " + directory + "; git " + commands[i];
    }
    seqRun(commands, delay, next);
  };
  /** Runs a sequence of operating system commands.
   * @param {array} commands  The operating system commands, e.g. `[ "cd <directory> ; grunt", .. ]`.
   * @param {int=1} delay Delay in second.
   * @param {function=} next Function called when the operation is completed.
   * @memberof GithubApi
   */
  var seqRun = function(commands, delay, next) {
    if (delay == undefined) delay = 1;
    if (commands.length > 0) {
      exec(commands[0], function(error, stdout, stderr) {
        if (stdout.trim() != "") {
          console.log(stdout);
        }
	if (stderr.trim() != "") {
	  console.log(stderr);
	}
        if (error == null) {
	  setTimeout(function() { seqRun(commands.slice(1), next); }, delay * 1000);
        } else {
          console.log("Error with '" + commands[0] + "': " + error);
	  process.exit();
        }
      });
    } else {
      if (next) {
        next();
      }
    }
  };
  // Creates the directory and its parent if required
  var mkdirs = function(path, isFileNotDir) {
    if (isFileNotDir) {
      if (path.indexOf("/") != -1) {
        mkdirs(path.substr(0, path.lastIndexOf("/")));
      }
    } else {
      if (path.indexOf("/") != -1) {
        mkdirs(path.substr(0, path.lastIndexOf("/")));
      }
      if (path != "." && path != ".." && path.length > 0 && !fs.existsSync(path)) {
        fs.mkdirSync(path);
      }
    }
  };
  // Inputs a password 
  var inputPassword = function(callback) {
    process.stdout.write("password ? :");
    var password = "";
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", function(key) {
      switch (key.toString()) {
       case "\n":
       case "\r":
       case "":
        process.stdin.setRawMode(false);
        process.stdin.pause();
        callback(password);
        break;

       case "":
        // Ctrl C
        process.exit();
        break;

       default:
        process.stdout.write("*");
        password += key;
        break;
      }
    });
  };
  // Object public exposition
  return {
    api: api,
    login: login,
    gitSync: gitSync,
    gitRun: gitRun,
    seqRun: seqRun
  };
}();
