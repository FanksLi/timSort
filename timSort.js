
function ArrayTimSortImpl(sortState) {
    const length = sortState.workArray.length;

    if (length < 2) return;

    // 遍历数组，寻找分区，合并分区

    let low = 0;
    let remaining = length;

    // const minRunLength = ComputeMinRunLength(remaining);


    while (remaining !== 0) {

        // 寻找分区并返回分区长度值
        let currentRunlength = CountAndMakeRun(sortState, low, low + remaining);

    //     if (currentRunlength < minRunLength) {

    //         // 扩展分区
    //         const forceRunLength = Math.min(minRunLength, remaining);

    //         BinaryInsertionSort(
    //             sort,
    //             low,
    //             low + currentRunlength,
    //             low + forceRunLength
    //         );

    //         currentRunlength = forceRunLength;
    //     }

    //     // 分区入栈
    //     PushRun(sortState, low, currentRunlength);

    //     // 合并分区
    //     MergeCollapse(sortState);

        // 寻找下一个分区

        low = low + currentRunlength;

        remaining = remaining - currentRunlength;
    }

    // // 合并栈中的所有分区，直到只剩一个，排序结束
    // MergeForceCollapse(sortState);

}

module.exports = ArrayTimSortImpl;


function CountAndMakeRun(sortState, lowArg, high) {
    const low = lowArg + 1;

    if(low === high) return 1;

    let runLength = 2;
    const workArray = sortState.workArray;

    const elementLow = workArray[low];
    const elementLowpre = workArray[low - 1];
    let order = sortState.compare(elementLow, elementLowpre);

    const isDescending = order < 0;

    let prevousElement = elementLow;
    for(let idx = low + 1; idx < high; idx++) {
        const currentElement = workArray[idx];
        order = sortState.compare(currentElement, prevousElement);

        if(isDescending) {
            // 严格降序
            if(order >= 0) break;

        } else {
            // 严格升序
            if(order < 0) break;
        }
        prevousElement = currentElement;
        ++runLength;
    }   
    if(isDescending) {
        Reverse(workArray, lowArg, lowArg + runLength);
    }
    return runLength;
}

function Reverse(workArray, form, to) {
    let low = form;
    let high = to - 1;

    while(low < high) {
        const elementLow = workArray[high];
        const elementHigh = workArray[low];

        workArray[low++] = elementLow;
        workArray[high--] = elementHigh;
    }   
}

function BinaryInsertionSort() {

}

function PushRun() {

}

function MergeCollapse() {

}

function MergeForceCollapse() {

}