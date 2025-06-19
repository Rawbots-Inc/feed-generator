# Makefile
ifneq ("$(wildcard .makeenv)","")
  include .makeenv
  export
endif

DOMAIN ?=repsky.unify.mx
feedgenFQDN   ?=feed-generator.${DOMAIN}

EMAIL4CERTS ?=

FEEDGEN_PUBLISHER_HANDLE ?=
FEEDGEN_EMAIL ?=
FEEDGEN_PUBLISHER_PASSWORD ?=
FEEDGEN_PUBLISHER_DID ?=

GOINSECURE :=${DOMAIN},*.${DOMAIN}
NODE_TLS_REJECT_UNAUTHORIZED :=0

Sfeed ?=caddy caddy-sidecar feed-generator

wDir ?=${PWD}

# data folder to persist container's into filesystem
dDir ?=${wDir}/data

# account folder (for feed-generator and others, created with bluesky API during ops).
aDir ?=${dDir}/accounts

# top level repos folder
rDir ?=${wDir}/repos

# file path to store generated passwords with openssl, during ops.
passfile ?=${wDir}/config/secrets-passwords.env

# docker-compose file
f ?=${wDir}/docker-compose.yaml

include ops/git.mk
include ops/certs.mk
include ops/docker.mk
include ops/patch.mk

.PHONY: genSecrets generateSecrets generateCA setup communityConfig communityVideoConfig build deploy publishFeed

genSecrets: ${passfile}
${passfile}: ./config/gen-secrets.sh
	wDir=${wDir} ./config/gen-secrets.sh > $@
	cat $@
	@echo "secrets generated and stored in $@"

generateSecrets:
	@echo "Generating secrets"
	@echo Install required tools if missing.
	apt install -y make pwgen
	(sudo curl -o /usr/local/bin/websocat -L https://github.com/vi/websocat/releases/download/v1.13.0/websocat.x86_64-unknown-linux-musl; sudo chmod a+x /usr/local/bin/websocat)

	@echo Generate and check container secrets.
	make genSecrets

generateCA:
	@echo "Generating CA"
	make getCAcert
	make installCAcert

setup:
	make generateSecrets
	make generateCA

build-images:
	docker compose build ${Sfeed}

deploy:
	make docker-start-bsky-feedgen

# Copy community.env to .env
communityConfig:
	@echo "Copying community.env → .env"
	cp feeds_config/community.env .env

# Copy community_video.env to .env
communityVideoConfig:
	@echo "Copying community_video.env → .env"
	cp feeds_config/community_video.env .env

# Run the feed publisher script
publishFeedEnv:
	@echo "Running publishFeedGen.ts"
	npx tsx scripts/publishFeedGen.ts
