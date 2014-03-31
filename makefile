publish : js/GithubApi.js
	node js/make.js

js/GithubApi.js : /home/vthierry/Work/mnemosyne/mnemosyne/task-forces/knowledge-to-data/ontology/src/GithubApi.js
	cp $^ $@

