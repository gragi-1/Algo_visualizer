let array = [];
let sorting = false;
let pause = false;
let resolvePause;

const visualization = d3.select("#visualization");

function generateArray() {
    if (sorting) return;
    array = Array.from({length: 20}, () => Math.floor(Math.random() * 100));
    updateVisualization();
}

function updateVisualization() {
    visualization.selectAll("*").remove();

    visualization.selectAll("div")
        .data(array)
        .enter()
        .append("div")
        .attr("class", "bar")
        .style("height", d => `${d * 3}px`)
        .each(function(d) {
            d3.select(this)
                .append("div")
                .attr("class", "label")
                .text(d);
        });
}

async function startSorting(algorithm) {
    if (sorting) return;
    sorting = true;
    if (algorithm === 'bubbleSort') await bubbleSort();
    if (algorithm === 'selectionSort') await selectionSort();
    if (algorithm === 'quickSort') await quickSort();
    sorting = false;
}

function pauseSorting() {
    pause = true;
}

function resumeSorting() {
    pause = false;
    if (resolvePause) resolvePause();
}

async function wait() {
    if (pause) {
        await new Promise(resolve => resolvePause = resolve);
    }
    await new Promise(r => setTimeout(r, 300));
}

async function bubbleSort() {
    let n = array.length;
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            highlightComparing(j, j + 1);
            if (array[j] > array[j + 1]) {
                await swap(j, j + 1);
            }
            await wait();
        }
    }
}

async function selectionSort() {
    let n = array.length;
    for (let i = 0; i < n - 1; i++) {
        let minIdx = i;
        for (let j = i + 1; j < n; j++) {
            highlightComparing(minIdx, j);
            if (array[j] < array[minIdx]) {
                minIdx = j;
            }
            await wait();
        }
        if (minIdx !== i) {
            await swap(i, minIdx);
        }
    }
}

async function quickSort(start = 0, end = array.length - 1) {
    if (start < end) {
        let pivotIndex = await partition(start, end);
        await Promise.all([
            quickSort(start, pivotIndex - 1),
            quickSort(pivotIndex + 1, end)
        ]);
    }
}

async function partition(start, end) {
    let pivotIndex = start;
    let pivotValue = array[end];
    highlightPivot(end);
    for (let i = start; i < end; i++) {
        highlightComparing(i, end);
        if (array[i] < pivotValue) {
            await swap(i, pivotIndex);
            pivotIndex++;
        }
        await wait();
    }
    await swap(pivotIndex, end);
    return pivotIndex;
}

function highlightComparing(index1, index2) {
    visualization.selectAll("div.bar")
        .data(array)
        .attr("class", (d, i) => i === index1 || i === index2 ? "bar comparing" : "bar")
        .style("height", d => `${d * 3}px`)
        .select(".label")
        .text(d => d);
}

function highlightPivot(index) {
    visualization.selectAll("div.bar")
        .data(array)
        .attr("class", (d, i) => i === index ? "bar pivot" : "bar")
        .style("height", d => `${d * 3}px`)
        .select(".label")
        .text(d => d);
}

async function swap(index1, index2) {
    visualization.selectAll("div.bar")
        .data(array)
        .attr("class", (d, i) => i === index1 || i === index2 ? "bar swapping" : "bar")
        .style("height", d => `${d * 3}px`)
        .select(".label")
        .text(d => d);

    [array[index1], array[index2]] = [array[index2], array[index1]];

    updateVisualization();
    await wait();
}

generateArray();
