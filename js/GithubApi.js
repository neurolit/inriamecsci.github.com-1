/** Encapsulates some interaction with a the git-hub https://github.com.
 * <p>It provides a simplified interface with the <a href="http://developer.github.com/v3">https://github.com API</a>.
 * <p>It uses the <a href="http://ajaxorg.github.io/node-github">node-github</a> module, to be installed using: <pre>sudo npm install -g github</pre></p>
 * <p>It allows to encapsulate both remote and local commands to initialize or synchronize a working-directory.</p>
 * 
 * <p>To be used via a construct of the form:<pre>
 * var fm = require("./GithubApi.njs");
 * fm.login("me"); // for example
 *</pre>
 *
 * @namespace
 * @version 0.0.1 (Sat, 17 Aug 2013 11:20:53 GMT)
 * @copyright <a href='http://www.cecill.info/licences/Licence_CeCILL-C_V1-en.html'>CeCILL-C</a>
 * @author vthierry <thierry.vieville@inria.fr>
 */
var GithubApi = function() {
  // Loads the required nodejs modules
  var githubAPI = require("github"), fs = require("fs"), exec = require("child_process").exec;
  /** The github API interface. 
   * <p>This allows us to access all <a href="http://ajaxorg.github.io/node-github">github API functions</a>.</p>
   */
  var api = new githubAPI({
    version: "3.0.0"
  });
  /** Logins to the github server.
   * @param {string} username The user name.
   * @param {string} password The user password. If not provided, the password is input via stdin.
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
   * @param {string} org The repository organisation, default is the user name.
   * @param {string} description The respositoty description, default is <tt>name/org</tt>.
   * @param {string} directory The local directory where to clone the repository, default is <tt>./name</tt>.
   * @param {object} files The local directory initial files, an object of the form <tt>{ filepath : filebody }</tt>.
   * @param {function} next  Function called when the operation is completed.
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
   * <p>It simply concatenates a <tt>pull ; commit ; push</tt> git command sequence.</p>
   * @param {string} directory The local directory where to clone the repository, default is <tt>.</tt>
   * @param {string} message The commit message, default is <tt>"commited from GithubApi"</tt>
   * @param {function} next  Function called when the operation is completed.
   * @memberof GithubApi
   */
  var gitSync = function(message, directory, next) {
    message = message == undefined ? "commited from GithubApi" : message;
    directory = directory == undefined ? "." : directory;
    gitRun(directory, [ "pull -q", 'commit -a -m "' + message + '"', "push" ], next);
  };
  /** Runs a sequence of git commands in a given directory.
   * @param {string} directory The working directory.
   * @param {array} commands  The git commands, e.g. <tt>[ "status", "add *" ]</tt>, thus without the "git" prefix.
   * @param {function} next Function called when the operation is completed.
   * @memberof GithubApi
   */
  var gitRun = function(directory, commands, next) {
    for (var i in commands) {
      commands[i] = "cd " + directory + "; git " + commands[i];
    }
    seqRun(commands, next);
  };
  /** Runs a sequence of operating system commands.
   * @param {array} commands  The operating system commands, e.g. <tt>[ "cd <directory> ; grunt", .. ]</tt>.
   * @param {function} next Function called when the operation is completed.
   * @memberof GithubApi
   */
  var seqRun = function(commands, next) {
    if (commands.length > 0) {
      exec(commands[0], function(error, stdout, stderr) {
        if (stdout.trim() != "") {
          console.log(stdout);
        }
        if (error == null) {
        } else {
          console.log("Error with '" + commands[0] + "': " + error);
          console.log(stderr);
        }
	seqRun(commands.slice(1), next);
      });
    } else {
      if (next) {
        next();
      }
    }
  };
  // Create the directory of the path its parent if they do not exists
  var mkdirs = function(path, parent) {
    if (parent) {
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
    api : api,
    login: login,
    gitSync: gitSync,
    gitRun: gitRun,
    seqRun: seqRun
  };
}();

module.exports = GithubApi;
