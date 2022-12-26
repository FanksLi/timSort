const ArrayTimSortImpl = require('./timSort');

function TimSort(array, compare = (a, b) => a - b) {
    const sortState = {
        workArray: array,
        compare: compare,

        // 记录分区信息的栈的大小
        pendingRunSize: 0,
        // 记录分区信息的栈
        pendingRuns: [],

        minGallop: 7,
        tempArray: [],
    };


    ArrayTimSortImpl(sortState);
    console.log(sortState.workArray);
    return sortState.workArray;
}

module.exports = TimSort;