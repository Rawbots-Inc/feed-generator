# Makefile
ifneq ("$(wildcard .env)","")
  include .env
  export
endif

DOMAIN ?=repsky.unify.mx
feedgenFQDN   ?=feed-generator.${DOMAIN}

EMAIL4CERTS ?=thanhbpc.dev@gmail.com

FEEDGEN_PUBLISHER_HANDLE ?=rskydev.bsky.social
FEEDGEN_EMAIL ?=thanhbpc.dev@gmail.com
FEEDGEN_PUBLISHER_PASSWORD ?=123456a@A
FEEDGEN_PUBLISHER_DID ?=did:plc:3A62sygyqvpetbfz57ebmwvql4
GOINSECURE :=${DOMAIN},*.${DOMAIN}
NODE_TLS_REJECT_UNAUTHORIZED :=0

Sdep  ?=caddy caddy-sidecar database redis test-wss test-ws
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

.PHONY: setupdir genSecrets generateSecrets generateCA setup images-test build-images deploy publishFeedEnv

setupdir:
	mkdir -p ${aDir}

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
	DOMAIN=$(DOMAIN) GOINSECURE=$(GOINSECURE) NODE_TLS_REJECT_UNAUTHORIZED=$(NODE_TLS_REJECT_UNAUTHORIZED) EMAIL4CERTS=$(EMAIL4CERTS) docker compose build ${Sfeed} 

deploy:
	make docker-start-bsky-feedgen

echo:
	@echo "Environment variables:"
	@echo "DOMAIN: ${DOMAIN}"
	@echo "EMAIL4CERTS: ${EMAIL4CERTS}"
	@echo "FEEDGEN_PUBLISHER_HANDLE: ${FEEDGEN_PUBLISHER_HANDLE}"
	@echo "FEEDGEN_EMAIL: ${FEEDGEN_EMAIL}"
	@echo "FEEDGEN_PUBLISHER_PASSWORD: ${FEEDGEN_PUBLISHER_PASSWORD}"
	@echo "FEEDGEN_PUBLISHER_DID: ${FEEDGEN_PUBLISHER_DID}"
	@echo "feedgenFQDN: ${feedgenFQDN}"