# Makefile

.PHONY: communityConfig communityVideoConfig publishFeed

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
