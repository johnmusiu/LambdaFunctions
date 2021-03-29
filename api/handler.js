"use strict";

const AWS = require("aws-sdk");

AWS.config.setPromisesDependency(require("bluebird"));
const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.price = (event, context, callback) => {
  let params = {
    TableName: "prices_table",
    ProjectExpression: "price",
    ScanIndexForward: false,
    Limit: 1,
  };

  const onScan = (err, data) => {
    if (err) {
      return callback(null, {
        error: JSON.stringify(err),
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET",
        },
      });
    } else {
      console.log(data);
      return callback(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET",
        },
        statusCode: 200,
        body: JSON.stringify({
          price: data.Items[0].price,
        }),
      });
    }
  };

  dynamoDb.scan(params, onScan);
};
