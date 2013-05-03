all :
	#for d in grains/* ; do if [ $$d \!= "grains/grains.json" ] ; then pushd $$d ; git pull ; popd ; fi ; done
	-git commit -q -a -m "mise à jour des grains avec le makefile"
	git push -q 
