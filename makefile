all :
	-for d in grains/* ; do if [ $$d \!= "grains/grains.json" ] ; then git submodule update --init $$d ; pushd $$d ; git pull origin master ; popd ; fi ; done
	-git commit -a -m "mise à jour des grains avec le makefile"
	-git push
