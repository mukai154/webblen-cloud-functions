import * as algoliasearch from 'algoliasearch'

export const ALGOLIA_APP_ID ='5WGDZA0Z6Z'
export const ALGOLIA_API_KEY ='6e3077d3ad170d533f04106836e26405'
export const ALGOLIA_CLIENT = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_API_KEY)
export const ALGOLIA_LOCATIONS_INDEX = ALGOLIA_CLIENT.initIndex('locations')
export const ALGOLIA_EVENTS_INDEX = ALGOLIA_CLIENT.initIndex('upcoming_events')
export const ALGOLIA_WEBLLEN_EVENTS_INDEX = ALGOLIA_CLIENT.initIndex('events');
export const ALGOLIA_COMMUNITIES_INDEX = ALGOLIA_CLIENT.initIndex('communities')
export const ALGOLIA_USERS_INDEX = ALGOLIA_CLIENT.initIndex('users')
export const ALGOLIA_POSTS_INDEX = ALGOLIA_CLIENT.initIndex('posts')

