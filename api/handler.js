"use strict";

const AWS = require("aws-sdk");

AWS.config.setPromisesDependency(require("bluebird"));
const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.price = (event, context, callback) => {
  let params = {
    TableName: "prices_table",
    Key: {
      id: "a871e850-90c0-11eb-aa8f-31a14b25820c",
    },
    ProjectExpression: "price",
  };

  const onScan = (err, data) => {
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
    };
    if (err) {
      return callback(null, {
        headers,
        error: JSON.stringify(err.error),
        statusCode: 500,
      });
    } else {
      console.log(data);
      return callback(null, {
        headers,
        statusCode: 200,
        body: JSON.stringify({
          price: data.Items[0].price,
        }),
      });
    }
  };

  dynamoDb.scan(params, onScan);
};
