"use strict";
const https = require("https");
const uuid = require("uuid");
const AWS = require("aws-sdk");
const id = "a871e850-90c0-11eb-aa8f-31a14b25820c";

AWS.config.setPromisesDependency(require("bluebird"));
const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.getPrice = (event, context) => {
  https
    .get("https://api.bitfinex.com/v1/pubticker/btcusd", (response) => {
      let res = "";

      response.on("data", (chunk) => {
        res += chunk;
      });

      response.on("end", function () {
        var params = {
          TableName: "prices_table",
          Key: {
            id: "a871e850-90c0-11eb-aa8f-31a14b25820c",
          },
        };

        dynamoDb.get(params, (err, data) => {
          if (err) {
            console.error(
              "Unable to read item. Error JSON:",
              JSON.stringify(err, null, 2)
            );
          } else {
            console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
            if (data.Item) {
              updateItem(JSON.parse(res).ask);
            } else {
              insertItem(JSON.parse(res).ask);
            }
          }
        });
      });
    })
    .on("error", (error) => {
      console.log(error.message);
    });
};

const insertItem = (price) => {
  let params = {
    TableName: "prices_table",
    Item: {
      id,
      price,
      created_at: new Date().getTime(),
    },
  };
  dynamoDb.put(params, (err, data) => {
    if (err) {
      console.log("Error", err);
    } else {
      console.log("Success", data);
    }
  });
};

const updateItem = (price) => {
  var params = {
    TableName: "prices_table",
    Key: {
      id,
    },
    UpdateExpression: "set price = :p",
    ExpressionAttributeValues: {
      ":p": price,
    },
    ReturnValues: "UPDATED_NEW",
  };

  console.log("Updating the item...");
  dynamoDb.update(params, function (err, data) {
    if (err) {
      console.error(
        "Unable to update item. Error JSON:",
        JSON.stringify(err, null, 2)
      );
    } else {
      console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
    }
  });
};
