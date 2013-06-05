publish :
	@echo "make publish"
	@git pull
	@-for g in `grep '"id"' grains/grains.json | sed 's/[^:]*[^"]*"\([^"]*\)".*/\1/'` ; do if [ \! -d "grains/$$g" ] ; then \
            echo ; echo "Create ./grains/$$g" ;\
	    git submodule add git://github.com/InriaMecsci/$$g.git ./grains/$$g ;\
	  fi ; done
	@-for d in grains/* ; do if [ -d $$d ] ; then \
            echo ; echo "Update ./grains/$$d" ;\
	    git submodule update --init $$d ; pushd $$d > /dev/null ; git pull origin master ; popd > /dev/null ;\
	  fi ; done
	@grunt
	@-echo ; echo "Commit" ; git commit -a -m "mise à jour des grains avec le makefile" ; git push

