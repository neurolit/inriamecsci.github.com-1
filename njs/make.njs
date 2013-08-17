// Loads the required nodejs modules
var fs = require("fs");
var ga = require("./GithubApi.njs");

var commands = [];
commands.push("git pull");
fs.readdir("grains", function(error, files) {
  if (error) {
    console.log(error);
  } else {
    for(var i in files) if (files[i] != "index.json") {
      commands.push("echo \"update ./grains/" +files[i]+"\"");
      commands.push("git submodule update --init ./grains/" +files[i]);
      commands.push("cd ./grains/" +files[i]+" ; git pull origin master");
    }
    commands.push("grunt");
    commands.push("echo \"commit\"");
    commands.push("git commit -a -m \"mise à jour des grains avec le makefile\"");
    commands.push("git push");
    ga.seqRun(commands);
  }
});
