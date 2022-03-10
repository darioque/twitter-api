// Get Tweet objects by ID, using bearer token authentication
// https://developer.twitter.com/en/docs/twitter-api/tweets/lookup/quick-start

const needle = require("needle");
const exportUsersToExcel = require("./exportService");

async function getLastTweetMetrics() {
    // The code below sets the bearer token from your environment variables
    // To set environment variables on macOS or Linux, run the export command below from the terminal:
    // export BEARER_TOKEN='YOUR-TOKEN'
    const token = process.env.BEARER_TOKEN;
    const endpointURL = "https://api.twitter.com/2/tweets?ids=";

    async function getRequest() {
        // These are the parameters for the API request
        // specify Tweet IDs to fetch, and any additional fields that are required
        // by default, only the Tweet ID and text are returned
        const params = {
            ids: "1501275605056176130", // Edit Tweet IDs to look up
            "tweet.fields": "created_at,public_metrics", // "non_public_metrics" needs account permissions
            expansions: "attachments.media_keys,attachments.poll_ids",
        };

        // this is the HTTP header that adds bearer token authentication
        const res = await needle("get", endpointURL, params, {
            headers: {
                "User-Agent": "v2TweetLookupJS",
                authorization: `Bearer ${token}`,
            },
        });

        if (res.body) {
            return res.body;
        } else {
            throw new Error("Unsuccessful request");
        }
    }

    (async () => {
        try {
            // Make request
            const allTweetsData = await getRequest();
            const allTweets = allTweetsData.data;
            

            exportUsersToExcel(
                allTweets,
            );

            return allTweets;
        } catch (e) {
            console.log(e);
            process.exit(-1);
        }
    })();
}

module.exports = getLastTweetMetrics;
