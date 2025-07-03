
export type DatabaseSchema = {
  post: Post;
  sub_state: SubState;
  follows: Follow;
  active_users: ActiveUser
};

export type Post = {
  /**
   * CID of the author
   */
  author: string
  /**
   * URI of the post
   */
  uri: string
  /**
   * CID of the post
   */
  cid: string
  /**
   * When the post was indexed by the app view
   */
  indexedAt: string
  /**
   * Embed of the post
   */
  embed: string | null
  /**
   * Community of the post
   */
  community: string
}


export type Follow = {
  /**
   * rKey of the follow
   */
  id: string;
  /**
   * The account doing the following
   */
  follower: string;
  /**
   * The account being followed
   */
  followed: string;
  /**
   * When the follow was created
   */
  createdAt: string;
};

export type SubState = {
  service: string
  cursor: number
}


export type ActiveUser = {
  /**
   * user DID call rsky feed
   */
  did: string

  /**
   * createdAt
   */
  firstSeen: string
}
