# Makefile

DOMAIN ?=repsky.unify.mx
EMAIL4CERTS ?=rawbotsteam@gmail.com

feedgenFQDN   ?=feed-generator.${DOMAIN}

FEEDGEN_PUBLISHER_HANDLE ?=rsky.ai
FEEDGEN_EMAIL ?=rawbotsteam@gmail.com
FEEDGEN_PUBLISHER_PASSWORD ?=123456a@A
FEEDGEN_PUBLISHER_DID ?=did:plc:4ah7wr6kehwauzdftnfnprse

GOINSECURE :=${DOMAIN},*.${DOMAIN}
NODE_TLS_REJECT_UNAUTHORIZED :=0

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

.PHONY: generateSecrets generateCA setup communityConfig communityVideoConfig publishFeed

generateSecrets:
	@echo "Generating secrets"
	@echo Install required tools if missing.
	apt install -y make pwgen
	(cd ops-helper/apiImpl ; npm install)
	(sudo curl -o /usr/local/bin/websocat -L https://github.com/vi/websocat/releases/download/v1.13.0/websocat.x86_64-unknown-linux-musl; sudo chmod a+x /usr/local/bin/websocat)

	@echo Check configuration.
	make echo

	@echo Generate and check container secrets.
	make genSecrets

generateCA:
	@echo "Generating CA"
	make getCAcert
	make installCAcert

setup:
	make generateSecrets
	make generateCA

# Copy community.env to .env
communityConfig:
	@echo "Copying community.env → .env"
	cp feeds_config/community.env .env

# Copy community_video.env to .env
communityVideoConfig:
	@echo "Copying community_video.env → .env"
	cp feeds_config/community_video.env .env

# Run the feed publisher script
publishFeed:
	@echo "Running publishFeedGen.ts"
	npx tsx scripts/publishFeedGen.ts
