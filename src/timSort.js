
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
                sortState,
                low,
                low + currentRunlength,
                low + forceRunLength
            );

            currentRunlength = forceRunLength;
        }

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
        ReverseRange(workArray, lowArg, lowArg + runLength);
    }
    return runLength;
}

// 翻转数组
function ReverseRange(workArray, form, to) {
    let low = form;
    let high = to - 1;

    while(low < high) {
        const elementLow = workArray[high];
        const elementHigh = workArray[low];

        workArray[low++] = elementLow;
        workArray[high--] = elementHigh;
    }   
}

// 计算分区最小长度值
function ComputeMinRunLength(nArg) {
    let n = nArg;
    let r = 0;

    while(n >= 64) {
        r = r | (n & 1);
        n = n >> 1;
    }
    const minRunLength = n + r;
    return minRunLength;
}

// 扩展分区
function BinaryInsertionSort(sortState, low, startArg, high) {
    const workArray = sortState.workArray;

    let start = low === startArg ? startArg + 1 : startArg;

    for(; start < high; ++start) {
        let left = low,
        right = start;

        const pivot = workArray[right];

        while(left < right) {
            const mid = left + ((right - left) >> 1);
            const order = sortState.compare(pivot, workArray[mid]);

            if(order < 0) {
                right = mid;
            } else {
                left = mid + 1;
            }
        }

        for(let p = start; p > left; --p) {
            workArray[p] = workArray[p - 1];
        }
        workArray[left] = pivot;
    }

}

function PushRun() {

}

function MergeCollapse() {

}

function MergeForceCollapse() {

}