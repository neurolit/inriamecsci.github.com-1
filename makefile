publish :
	@echo "make publish"
	@-for g in `grep '"id"' grains/grains.json | sed 's/[^:]*[^"]*"\([^"]*\)".*/\1/'` ; do if [ \! -d "grains/$$g" ] ; then \
            echo "\nCreate ./grains/$$g" ;\
	    git submodule add git://github.com/InriaMecsci/$$g.git ./grains/$$g ;\
	  fi ; done
	@-for d in grains/* ; do if [ -d $$d ] ; then \
            echo "\nUpdate ./grains/$$d" ;\
	    git submodule update --init $$d ; pushd $$d > /dev/null ; git pull origin master ; popd > /dev/null ;\
	  fi ; done
	@-git commit -a -m "mise à jour des grains avec le makefile"
	@-git push

