const {ArrayTimSortImpl} = require('./timSort');

function TimSort(array, compare = (a, b) => a - b) {
    const sortState = {
        workArray: array,
<<<<<<< Updated upstream:index.js
        Compare: compare,
=======
        compare: compare,

        // 记录分区信息的栈的大小
        pendingRunSize: 0,
        // 记录分区信息的栈
        pendingRuns: [],

        minGallop: 7,
>>>>>>> Stashed changes:src/index.js
    };


    ArrayTimSortImpl(sortState);
    return sortState.workArray;
}

module.export = TimSort;