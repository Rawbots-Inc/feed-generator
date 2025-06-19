# variable to specify branch to apply patch. as below, <empty> then apply patch to current branch.
branch2patch=

#patch-dockerbuild: ${rDir}/feed-generator/.dockerbuild  ${rDir}/indigo/.dockerbuild  ${rDir}/atproto/.dockerbuild ${rDir}/ozone/.dockerbuild
#patch-dockerbuild: ${rDir}/indigo/.dockerbuild  ${rDir}/atproto/.dockerbuild ${rDir}/ozone/.dockerbuild ${rDir}/social-app/.dockerbuild ${rDir}/jetstream/.dockerbuild

# generate targets for patch-dockerbuild from variables like above sample;   items=${_nrepo}-${nopatch},  with prefix=${rDir}  and  suffix=/.dockerbuild
_nopatch ?=did-method-plc pds
_prepo ?=$(filter-out ${_nopatch},${_nrepo})
patch-dockerbuild:  $(addprefix ${rDir}/, $(addsuffix /.dockerbuild, ${_prepo}))

${rDir}/feed-generator/.dockerbuild:
	@echo "make branch and applying patch..."
	(cd ${rDir}/feed-generator; git status; git checkout ${branch2patch} -b dockerbuild )
	for ops in `ls ${wDir}/patching/1*.sh | grep feed-generator`; do wDir=${wDir} rDir=${rDir} pDir=${wDir}/patching DOMAIN=${DOMAIN} asof=${asof}  $${ops} ; done
	touch $@
	(cd ${rDir}/feed-generator; git add . ; git commit -m "update: dockerbuild"; )

