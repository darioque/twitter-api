const xlsx = require("xlsx");
const path = require("path");

const exportExcel = (data) => {
    const workSheetColumnNames = [
        "ID",
        "TWEET",
        "RT_COUNT",
        "REPLY_COUNT",
        "LIKE_COUNT",
        "QUOTE_COUNT",
        "DATE_OF_TWEET",
    ];
    const filePath = `./outputFiles/nft11-data.xlsx`;
    const workSheetName = "Tweets";

    const workBook = xlsx.utils.book_new();
    const workSheetData = [workSheetColumnNames, ...data];
    const workSheet = xlsx.utils.aoa_to_sheet(workSheetData);
    xlsx.utils.book_append_sheet(workBook, workSheet, workSheetName);
    xlsx.writeFile(workBook, path.resolve(filePath));
    xlsx.write
};
const exportUsersToExcel = (
    tweets,
    workSheetColumnNames,
    workSheetName,
    filePath
) => {
    const data = tweets.map((tweet) => {
        return [
            tweet.id,
            tweet.text,
            tweet.public_metrics.retweet_count,
            tweet.public_metrics.reply_count,
            tweet.public_metrics.like_count,
            tweet.public_metrics.quote_count,
            tweet.created_at,
        ];
    });
    exportExcel(data, workSheetColumnNames, workSheetName, filePath);
};

module.exports = exportUsersToExcel;
