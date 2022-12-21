const {ArrayTimSortImpl} = require('./timSort');

function TimSort(array, compare = (a, b) => a - b) {
    const sortState = {
        workArray: array,
        Compare: compare,
    };


    ArrayTimSortImpl(sortState);

    return sortState.workArray;
}

module.export = TimSort;