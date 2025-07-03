export type Feed = {
    name: string
    displayName: string
    description: string
    avatarPath: string
    videoOnly: boolean
}

export const feeds: Feed[] = [
    {
        name: 'community',
        displayName: 'RepSky',
        description: 'A feed from posts on various websites all over the internet.',
        avatarPath: 'src/avatar/community.png',
        videoOnly: false,
    },
    {
        name: 'community-video',
        displayName: 'RepSky Video',
        description: 'A feed from video posts on various websites all over the internet.',
        avatarPath: 'src/avatar/community_video.png',
        videoOnly: true,
    },
    {
        name: 'following',
        displayName: "Following",
        description: "",
        avatarPath: "src/avatar/community.png",
        videoOnly: false,
    }
]
