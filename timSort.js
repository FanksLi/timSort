
function ArrayTimSortImpl(sortState) {
    const length = sortState.workArray.length;

    if (length < 2) return;

    // 遍历数组，寻找分区，合并分区

    let low = 0;
    let remaining = length;

    const minRunLength = ComputeMinRunLength(remaining);


    while (remaining !== 0) {

        // 寻找分区并返回分区长度值
        let currentRunlength = CountAndMakeRun(sortState, low, low + remaining);

        if (currentRunlength < minRunLength) {

            // 扩展分区
            const forceRunLength = Math.min(minRunLength, remaining);

            BinaryInsertionSort(
                sort,
                low,
                low + currentRunlength,
                low + forceRunLength
            );

            currentRunlength = forceRunLength;
        }

        // 分区入栈
        PushRun(sortState, low, currentRunlength);

        // 合并分区
        MergeCollapse(sortState);
    }

}

module.export = ArrayTimSortImpl;


function CountAndMakeRun() {

}

function BinaryInsertionSort() {

}

function PushRun() {

}

function MergeCollapse() {
    
}