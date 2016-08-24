'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.deck.core.filterModel.dependentFilter.service', [
  require('../../utils/lodash.js')
])
  .factory('dependentFilterService', function (_) {

    function digestDependentFilters ({ pool, dependencyOrder, sortFilter }) {
      let headings = dependencyOrder.reduce(generateIterator(sortFilter), { pool, headings: {} }).headings;
      return headings;
    }

    function generateIterator (sortFilter) {
      return function iterator (acc, field) {
        let { headings, pool } = acc;
        headings[field] = grabHeadingsForField(pool, field);
        unselectUnavailableHeadings(headings[field], sortFilter[field]);
        acc.pool = filterPoolBySelectedField(pool, field, sortFilter);
        return acc;
      };
    }

    function grabHeadingsForField (pool, field) {
      return _(pool).pluck(field).uniq().compact().valueOf();
    }

    function filterPoolBySelectedField (pool, field, sortFilter) {
      let selected = sortFilter[field];
      if (!mapTruthyHashKeysToList(selected).length) {
        return pool;
      }

      return pool.filter(unit => selected[unit[field]]);
    }

    function unselectUnavailableHeadings (headings, selected) {
      if (!selected) {
        return;
      }

      let headingSet = setBuilder(headings);
      Object.keys(selected).forEach(key => {
        if (!headingSet[key]) {
          delete selected[key];
        }
      });
    }

    function setBuilder (array) {
      return array.reduce((s, el) => {
        if (!(el in s)) {
          s[el] = true;
        }
        return s;
      }, {});
    }

    function mapTruthyHashKeysToList (hash) {
      return Object.keys(_.pick(hash, _.identity));
    }

    return { digestDependentFilters };
  });
