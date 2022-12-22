const sort = require('../src/index');

const compare = (a, b) => a - b;

describe('数组排序', () => {
    // test('数组分区 Test', () => {
    //     const arr = [5, 1, 2, 4, 3];

    //     const res = sort(arr, compare);
    //     console.log(res);
    //     expect(res).toEqual([1, 5, 2, 4, 3]);
    // });

    test('1-10', () => {
        const arr = [10, 2, 3, 1, 4, 5, 6, 8, 9, 7];

        const res = sort(arr, compare);
        expect(res).toEqual(arr.sort(compare));
    });
    
});