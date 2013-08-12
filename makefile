default : publish1

publish :
	node njs/make.njs


publish1 :
	@echo "make publish"
	@git pull
	@-for d in grains/* ; do if [ -d $$d ] ; then \
            echo ; echo "Update ./grains/$$d" ;\
	    git submodule update --init $$d ; pushd $$d > /dev/null ; git pull origin master ; popd > /dev/null ;\
	  fi ; done
	@grunt
	@-echo ; echo "Commit" ; git commit -a -m "mise à jour des grains avec le makefile" ; git push

