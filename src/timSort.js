const invariant = require("invariant");

let kMinGallopWins = 7;

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

        // 分区入栈
        PushRun(sortState, low, currentRunlength);

        //     // 合并分区
        MergeCollapse(sortState);

        // 寻找下一个分区

        low = low + currentRunlength;

        remaining = remaining - currentRunlength;
    }

    // // 合并栈中的所有分区，直到只剩一个，排序结束
    // MergeForceCollapse(sortState);

}


function CountAndMakeRun(sortState, lowArg, high) {
    const low = lowArg + 1;

    if (low === high) return 1;

    let runLength = 2;
    const workArray = sortState.workArray;

    const elementLow = workArray[low];
    const elementLowpre = workArray[low - 1];
    let order = sortState.compare(elementLow, elementLowpre);

    const isDescending = order < 0;

    let prevousElement = elementLow;
    for (let idx = low + 1; idx < high; idx++) {
        const currentElement = workArray[idx];
        order = sortState.compare(currentElement, prevousElement);

        if (isDescending) {
            // 严格降序
            if (order >= 0) break;

        } else {
            // 严格升序
            if (order < 0) break;
        }
        prevousElement = currentElement;
        ++runLength;
    }
    if (isDescending) {
        ReverseRange(workArray, lowArg, lowArg + runLength);
    }
    return runLength;
}

// 翻转数组
function ReverseRange(workArray, form, to) {
    let low = form;
    let high = to - 1;

    while (low < high) {
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

    while (n >= 64) {
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

    for (; start < high; ++start) {
        let left = low,
            right = start;

        const pivot = workArray[right];

        while (left < right) {
            const mid = left + ((right - left) >> 1);
            const order = sortState.compare(pivot, workArray[mid]);

            if (order < 0) {
                right = mid;
            } else {
                left = mid + 1;
            }
        }

        for (let p = start; p > left; --p) {
            workArray[p] = workArray[p - 1];
        }
        workArray[left] = pivot;
    }

}

// 分区起始下标，length就是分区的长度
function PushRun(sortState, base, length) {
    const stackSize = sortState.pendingRunSize;

    SetPendingRunBase(sortState.pendingRuns, stackSize, base);
    SetPendingRunLength(sortState.pendingRuns, stackSize, length);

    sortState.pendingRunSize = stackSize + 1;
}

function GetPendingRunBase(pendingRuns, run) {
    return pendingRuns[run << 1];
}

function SetPendingRunBase(pendingRuns, run, value) {
    pendingRuns[run << 1] = value;
}

function GetPendingRunLength(pendingRuns, run) {
    return pendingRuns[(run << 1) + 1];
}

function SetPendingRunLength(pendingRuns, run, value) {
    pendingRuns[(run << 1) + 1] = value;
}

function MergeCollapse(sortState) {
    const pendingRuns = sortState.pendingRuns;

    while (sortState.pendingRunSize > 1) {
        let n = sortState.pendingRunSize - 2;
        if (
            !RunInvariantEstablished(pendingRuns, n + 1) ||
            !RunInvariantEstablished(pendingRuns, n)
        ) {
            if (
                GetPendingRunLength(pendingRuns, n - 1) <
                GetPendingRunLength(pendingRuns, n + 1)
            ) {
                --n;
            }
            MergeAt(sortState, n);
        } else if (
            GetPendingRunLength(pendingRuns, n) <=
            GetPendingRunLength(pendingRuns, n + 1)
        ) {
            MergeAt(sortState, n);
        } else {
            break;
        }
    }
}

function RunInvariantEstablished(pendingRuns, n) {
    if (n < 2) return true;
    const runLengthN = GetPendingRunLength(pendingRuns, n);
    const runLengthNM = GetPendingRunLength(pendingRuns, n - 1);
    const runLengthNMM = GetPendingRunLength(pendingRuns, n - 2);

    return runLengthNMM > runLengthNM + runLengthN;
}

function MergeAt(sortState, i) {
    const workArray = sortState.workArray;
    const pendingRuns = sortState.pendingRuns;
    const stackSize = sortState.pendingRunSize;

    // 获取分区a的起始下标
    let baseA = GetPendingRunBase(pendingRuns, i);
    // 分区a的长度
    let baseLengthA = GetPendingRunLength(pendingRuns, i);
    // 获取分区b的起始下标
    let baseB = GetPendingRunBase(pendingRuns, i + 1);
    // b分区的长度
    let baseLengthB = GetPendingRunLength(pendingRuns, i + 1);
    SetPendingRunLength(pendingRuns, i, baseLengthA + baseLengthB);

    if (i === stackSize - 3) {
        // 如果i是倒数第三个分区，合并就是倒数第二和倒数第三，那么倒数第一个分区
        // 倒数第一个分区的下标和长度
        const base = GetPendingRunBase(pendingRuns, i + 2);
        const length = GetPendingRunLength(pendingRuns, i + 2);

        SetPendingRunBase(pendingRuns, i + 1, base);
        SetPendingRunLength(pendingRuns, i + 1, length);
    }
    sortState.pendingRunSize--;

    const keyRight = workArray[baseB];
    // array[base+offset-1] <= key<array[base + offset]

    const k = GallopRight(sortState, keyRight, baseA, baseLengthA, 0);

    baseA = baseA + k;
    baseLengthA = baseLengthA - k;

    if (baseLengthA === 0) return;

    const keyLeft = workArray[baseA + baseLengthA - 1];
    // array[base + offset] < key <= array[base + offset + 1]
    baseLengthB = GallopLeft(sortState, keyLeft, baseB, baseLengthB, baseLengthB - 1);

    if(baseLengthB === 0) return;

    if(baseLengthA === baseLengthB) {
        MergeLow(sortState, baseA, baseLengthA, baseB, baseLengthB);
    } else {
        MergeHigh(sortState, baseA, baseLengthA, baseB, baseLengthB);
    }

}

// array[base+offset-1] <= key<array[base + offset]
function GallopRight(sortState, key, base, length, hint) {
    const workArray = sortState.workArray;
    let lastOfs = 0;
    let offset = 1;

    const baseHintElement = workArray[base + hint];
    let order = sortState.compare(key, baseHintElement);
    if (order < 0) {
        const maxOfs = hint + 1;
        while (offset < maxOfs) {
            const offsetElement = workArray[base + hint - offset];
            order = sortState.compare[key, offsetElement];

            if (order >= 0) {
                offset = maxOfs;
            }
        }

        if (offset > maxOfs) {
            offset = maxOfs;
        }

        const tmp = lastOfs;
        lastOfs = hint - offset;
        offset = hint - tmp;

    } else {
        const maxOfs = length - hint;
        while (offset < maxOfs) {
            const offsetElement = workArray[base + hint + offset];
            order = sortState.compare(key, offsetElement);

            if (order < 0) break;
            lastOfs = offset;
            offset = (offset << 1) + 1;

            if (offset <= 0) {
                offset = maxOfs;
            }

            if (offset > maxOfs) {
                offset = maxOfs;
            }

            lastOfs = lastOfs + hint;
            offset = offset + hint;
        }

        offset++;
        while (lastOfs < offset) {
            const m = lastOfs + ((offset - lastOfs) >> 1);

            order = sortState.compare(key, workArray[base + m]);

            if (order < 0) {
                // 左区间
                offset = m;
            } else {
                lastOfs = m + 1;
            }
        }
    }
    // invariant(offset === 0, 'err rung');
    return offset;
}
// array[base + offset] < key <= array[base + offset + 1]
function GallopLeft(sortState, key, base, length, hint) {
    const workArray = sortState.workArray;

    let lastOfs = 0;
    let offset = 1;

    // 分区b最大值
    const baseHintElement = workArray[base + hint];
    let order = sortState.compare(baseHintElement, key);

    if (order < 0) {
        const maxOfs = length + hint;

        while (offset < maxOfs) {
            const offsetElement = workArray[base + offset + hint];
            order = sortState.compare(offsetElement, key);

            if (order >= 0) break;

            lastOfs = offset;
            offset = (offset << 1) + 1;

            if (offset <= 0) {
                offset = maxOfs;
            }
        }

        if (offset > maxOfs) {
            offset = maxOfs;
        }

        lastOfs = lastOfs + hint;
        offset = offset + hint;

    } else {
        const maxOfs = hint + 1;

        while (offset < maxOfs) {
            const offsetElement = workArray[base + hint - offset];
            order = sortState.compare(offsetElement, key);

            if (order < 0) break;

            lastOfs = offset;
            offset = (offset << 1) + 1;

            if (offset <= 0) {
                offset = maxOfs;
            }
        }

        if (offset > maxOfs) {
            offset = maxOfs;
        }

        const tmp = lastOfs;
        lastOfs = hint - offset;
        offset = hint - tmp;
    }

    lastOfs++;

    while (lastOfs < offset) {
        const m = lastOfs + ((offset - lastOfs) >> 1);
        order = sortState.compare(workArray[base + m], key);
        if (order < 0) {
            lastOfs = m + 1;
        } else {
            offset = m;
        }
    }

    return offset;
}

function MergeHigh(sortState, baseA, lengthAArg, baseB, lengthBArg) {
    console.log(sortState, baseA, lengthAArg, baseB, lengthBArg);

    invariant(0 < lengthAArg && 0 < lengthBArg, 'length > 0');
    invariant(0 <= baseA && 0 < baseB, '分区A起始下标>=0, 分区b的起始下标>0');
    invariant(baseA + lengthAArg === baseB, 'AB分区连续');

    let lengthA = lengthAArg;
    let lengthB = lengthBArg;

    const tempArray = new Array(lengthBArg);
    const workArray = sortState.workArray;

    Copy(workArray, baseB, tempArray, 0, lengthB);

    let dest = baseB + lengthB - 1;
    let cursorA = baseA + lengthA - 1;

    let cursorTemp = lengthB - 1;
    workArray[dest--] = workArray[cursorA--];

    if (--lengthA === 0) {
        Succeed();
        return;
    }

    if (lengthB === 1) {
        CopyA();
        return;
    }

    let minGallop = sortState.minGallop;
    while (1) {
        let nofWinsA = 0;
        let nofWinsB = 0;

        while (1) {
            const order = sortState.compare(tempArray[cursorTemp], workArray[cursorA]);

            if (order < 0) {
                workArray[dest--] = workArray[cursorA--];
                ++nofWinsA;
                --lengthA;
                nofWinsB = 0;

                if (lengthA === 0) {
                    Succeed();
                    return;
                }

                if (nofWinsA >= minGallop) break;
            } else {
                workArray[dest--] = tempArray[cursorTemp--];
                ++nofWinsB;
                --lengthB;
                nofWinsA = 0;

                if (lengthB === 1) {
                    CopyA();
                    return;
                }

                if (nofWinsB >= minGallop) break;
            }
        }
 
        ++minGallop;
        let firstIteration = true;
        while (nofWinsA >= kMinGallopWins || nofWinsB >= kMinGallopWins || firstIteration) {
            firstIteration = false;
            invariant(lengthA > 0 && lengthB > 1, '');
            minGallop = Math.max(1, minGallop - 1);
            sortState.minGallop = minGallop;

            // 从分区A进行快速查找，key是分区B的最大值
            // 从分区A寻找比key小于等于的值的个数

            let k = GallopRight(sortState, workArray, tempArray[cursorTemp], baseA, lengthA, lengthA - 1);
            nofWinsA = lengthA - k;
            if(nofWinsA > 0) {
                // 有nofwinsA，连续个元素比B分区的最大值要大

                dest -= nofWinsA;
                cursorA -= nofWinsA;

                Copy(workArray, cursorA + 1, workArray, dest + 1, nofWinsA);

                lengthA -= nofWinsA;

                if(lengthA === 0) {
                    Succeed();
                    return;
                }
            }
            workArray[dest--] = tempArray[cursorTemp--];

            if(--lengthB === 1) {
                CopyA();
                return;
            }

            // 在B分区当中寻找A分区的最大值还要大于等于的个数
            // k是分区b中比key小于的值的个数
            k = GallopLeft(sortState, tempArray, workArray[cursorA], 0, lengthB, lengthB - 1);

            nofWinsB = lengthB - k;

            if(nofWinsB > 0) {
                // 在b分区中，有nofWinsB个元素比a分区最大值还要大
                dest -= nofWinsB;
                cursorTemp -= nofWinsB;
                Copy(tempArray, cursorTemp + 1, workArray, dest + 1, nofWinsB);
                lengthB -= nofWinsB;

                if(lengthB === 1) {
                    CopyA();
                    return;
                }

                if(lengthB === 0) {
                    // Succeed();
                    return;
                }
            }

            workArray[dest--] = workArray[cursorA--];

            if(--lengthA === 0) {
                Succeed();
                return;
            }
        }


        ++minGallop;
        sortState.minGallop = minGallop;
    }
    function Succeed() {
        if (lengthB > 0) {
            invariant(lengthB === 1 && lengthA > 1, 'wrong');
            Copy(tempArray, 0, workArray, dest - lengthB + 1, lengthB);
        }
    }

    function CopyA() {
        invariant(lengthB === 1 && lengthA > 0, 'wrong');

        dest -= lengthA;
        cursorA -= lengthA;
        Copy(workArray, cursorA + 1, workArray, dest + 1, lengthA);

        workArray[dest] = tempArray[cursorTemp];
    }
}

function MergeLow(source, srcPos, target, dstPos, length) { }



function Copy(source, srcPos, target, dstPos, length) {

    if(srcPos < dstPos) {
        let srcIdx = srcPos + length - 1;
        let dstIdx = dstPos + length - 1;

        while(srcIdx >= dstIdx) {
            target[dstIdx--] = source[srcIdx--];
        }

    } else {
        let srcIdx = srcPos;
        let dstIdx = dstPos;
        const to = srcPos + length;
        while(srcIdx < to) {
            target[dstIdx++] = source[srcIdx++];
        }
    }
}

module.exports = ArrayTimSortImpl;
