const sort = require('../index');

describe('数组排序', () => {
    test('数组分区 Test', () => {
        console.log(123);
        const arr = [5, 1, 2, 4, 3];

        const res = sort(arr);
    
        expect(res).toEqual([1, 5, 2, 4, 3]);
    });
    
});