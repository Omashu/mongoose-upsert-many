'use strict';

/**
 * Load helpers
 */
const pick = require('lodash/pick');
const modelToObject = require('./helpers/model-to-object');
const matchCriteria = require('./helpers/match-criteria');
const arrayKeys = require('./helpers/array-keys');

/**
 * Apply bulk upsert helper to schema
 */
module.exports = function upsertMany(schema) {

  schema.statics.upsertMany = function(items, matchFields, args) {
    const props = Object.assign({}, { update: false }, args || {});

    //Use default match fields if none provided
    matchFields = matchFields || schema.options.upsertMatchFields;
    if (!Array.isArray(matchFields) || matchFields.length === 0) {
      matchFields = ['_id'];
    }

    //Create bulk operation
    const bulk = this.collection.initializeUnorderedBulkOp();
    items
      .map(item => modelToObject(item, this))
      .forEach((item, index) => {

        //Extract match criteria
        const match = matchCriteria(item, matchFields);

        //Can't have _id field when upserting item
        delete item._id;

        //Create upsert
        const op = bulk
          .find(match)
          .upsert();

        if (props.update) {
          const pickKeys = arrayKeys(items[index]);
          const values = pick(item, pickKeys);
          op.updateOne({ $set: values });
          return;
        }

        op.replaceOne(item);
      });

    //Execute bulk operation wrapped in promise
    return new Promise((resolve, reject) => {
      bulk.execute((error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      });
    });
  };
};
