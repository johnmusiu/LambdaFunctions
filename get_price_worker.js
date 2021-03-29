"use strict";
const https = require("https");
const uuid = require("uuid");
const AWS = require("aws-sdk");

AWS.config.setPromisesDependency(require("bluebird"));
const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.getPrice = (event, context) => {
  https
    .get("https://api.bitfinex.com/v1/pubticker/btcusd", (response) => {
      let data = "";

      response.on("data", (chunk) => {
        data += chunk;
      });

      response.on("end", function () {
        let params = {
          TableName: "prices_table",
          Item: {
            id: uuid.v1(),
            price: JSON.parse(data).ask,
            created_at: new Date().getTime().toString(),
          },
        };
        dynamoDb.put(params, (err, data) => {
          if (err) {
            console.log("Error", err);
          } else {
            console.log("Success", data);
          }
        });
        console.log(JSON.parse(data).ask);
      });
    })
    .on("error", (error) => {
      console.log(error.message);
    });
};
