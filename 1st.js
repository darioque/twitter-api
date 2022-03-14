// Search for Tweets within the past seven days
// https://developer.twitter.com/en/docs/twitter-api/tweets/search/quick-start/recent-search

const needle = require('needle');
// The code below sets the bearer token from your environment variables
// To set environment variables on macOS or Linux, run the export command below from the terminal:
// export BEARER_TOKEN='YOUR-TOKEN'
const token = process.env.BEARER_TOKEN;

const endpointUrl = "https://api.twitter.com/2/tweets/search/recent";

async function getRequest() {

    // Edit query parameters below
    // specify a search query, and any additional fields that are required
    // by default, only the Tweet ID and text fields are returned
    const params = {
        'query': 'from:nft11_official -is:retweet',
        'tweet.fields': 'created_at,public_metrics',
        'user.fields': 'public_metrics',
        expansions: "attachments.media_keys,attachments.poll_ids",
    }

    const res = await needle('get', endpointUrl, params, {
        headers: {
            "User-Agent": "v2RecentSearchJS",
            "authorization": `Bearer ${token}`
        }
    })

    if (res.body) {
        return res.body;
    } else {
        throw new Error('Unsuccessful request');
    }
}

(async () => {
    try {
        // Make request
        const response = await getRequest();
		let interactions = 0
		let impressions = 0
		let link_clicks = 0
		response.data.forEach((tweet) => {
            console.log(tweet.id);
			interactions += tweet.public_metrics.reply_count + tweet.public_metrics.retweet_count + tweet.public_metrics.like_count + tweet.public_metrics.quote_count
		})
		console.log(`interacciones ${interactions}, impresiones ${impressions}, click en links ${link_clicks}`);
        // exportUsersToExcel(response.data)
    } catch (e) {
        console.log(e);
        process.exit(-1);
    }
    process.exit();
})();