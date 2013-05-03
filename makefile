public :
	@echo "make publish" > makefile.log
	@-for d in grains/* ; do if [ $$d \!= "grains/grains.json" ] ; then \
	    git submodule update --init $$d ; pushd $$d ; git pull origin master ; popd ;\
	  fi ; done >> makefile.log
	@-git commit -a -m "mise à jour des grains avec le makefile" >> makefile.log
	@-git push >> makefile.log

