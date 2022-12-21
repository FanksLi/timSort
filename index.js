const ArrayTimSortImpl = require('./timSort');

function TimSort(array, compare = (a, b) => a - b) {
    const sortState = {
        workArray: array,
        compare: compare,
    };


    ArrayTimSortImpl(sortState);

    return sortState.workArray;
}

module.exports = TimSort;