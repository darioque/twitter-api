const got = require("got");
const crypto = require("crypto");
const OAuth = require("oauth-1.0a");
const qs = require("querystring");
const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
});
const needle = require("needle");
// Search for Tweets within the past seven days
// https://developer.twitter.com/en/docs/twitter-api/tweets/search/quick-start/recent-search

const consumer_key = process.env.CONSUMER_KEY;
const consumer_secret = process.env.CONSUMER_SECRET;

const tweetIDs = "1503105654252212225,1503008366678839299,1502719997713522690,1501275605056176130"
// These are the parameters for the API request
// specify Tweet IDs to fetch, and any additional fields that are required
// by default, only the Tweet ID and text are returned
const params = "tweet.fields=created_at,public_metrics,non_public_metrics"; // Edit optional query parameters here

const endpointURL = `https://api.twitter.com/2/tweets?ids=${tweetIDs}&${params}`;

// this example uses PIN-based OAuth to authorize the user
const requestTokenURL =
    "https://api.twitter.com/oauth/request_token?oauth_callback=oob";
const authorizeURL = new URL("https://api.twitter.com/oauth/authorize");
const accessTokenURL = "https://api.twitter.com/oauth/access_token";
const oauth = OAuth({
    consumer: {
        key: consumer_key,
        secret: consumer_secret,
    },
    signature_method: "HMAC-SHA1",
    hash_function: (baseString, key) =>
        crypto.createHmac("sha1", key).update(baseString).digest("base64"),
});

async function input(prompt) {
    return new Promise(async (resolve, reject) => {
        readline.question(prompt, (out) => {
            readline.close();
            resolve(out);
        });
    });
}

async function requestToken() {
    const authHeader = oauth.toHeader(
        oauth.authorize({
            url: requestTokenURL,
            method: "POST",
        })
    );

    const req = await got.post(requestTokenURL, {
        headers: {
            Authorization: authHeader["Authorization"],
        },
    });

    if (req.body) {
        return qs.parse(req.body);
    } else {
        throw new Error("Cannot get an OAuth request token");
    }
}

async function accessToken({ oauth_token, oauth_token_secret }, verifier) {
    const authHeader = oauth.toHeader(
        oauth.authorize({
            url: accessTokenURL,
            method: "POST",
        })
    );

    const path = `https://api.twitter.com/oauth/access_token?oauth_verifier=${verifier}&oauth_token=${oauth_token}`;

    const req = await got.post(path, {
        headers: {
            Authorization: authHeader["Authorization"],
        },
    });

    if (req.body) {
        return qs.parse(req.body);
    } else {
        throw new Error("Cannot get an OAuth request token");
    }
}

async function getRequest({ oauth_token, oauth_token_secret }) {
    const token = {
        key: oauth_token,
        secret: oauth_token_secret,
    };

    const authHeader = oauth.toHeader(
        oauth.authorize(
            {
                url: endpointURL,
                method: "GET",
            },
            token
        )
    );

    const req = await got(endpointURL, {
        headers: {
            Authorization: authHeader["Authorization"],
            "user-agent": "v2TweetLookupJS",
        },
    });

    if (req.body) {
        return JSON.parse(req.body);
    } else {
        throw new Error("Unsuccessful request");
    }
}

(async () => {
    try {
        // Get request token
        const oAuthRequestToken = await requestToken();

        // Get authorization
        authorizeURL.searchParams.append(
            "oauth_token",
            oAuthRequestToken.oauth_token
        );
        console.log("Please go here and authorize:", authorizeURL.href);
        const pin = await input("Paste the PIN here: ");

        // Get the access token
        const oAuthAccessToken = await accessToken(
            oAuthRequestToken,
            pin.trim()
        );

        // Make the request
        const response = await getRequest(oAuthAccessToken);
        console.log(response);
		let interactions = 0
		let impressions = 0
		let link_clicks = 0
		response.data.forEach((tweet) => {
			interactions += tweet.public_metrics.reply_count + tweet.public_metrics.retweet_count + tweet.public_metrics.like_count + tweet.public_metrics.quote_count
			impressions += tweet.non_public_metrics.impression_count
			link_clicks += tweet.non_public_metrics.user_profile_clicks?? 0 + tweet.non_public_metrics.url_link_clicks?? 0
		})
        console.dir(response, {
            depth: null,
        });
		console.log(`interacciones ${interactions}, impresiones ${impressions}, click en links ${link_clicks}`);
    } catch (e) {
        console.log(e);
        process.exit(-1);
    }
    process.exit();
})();