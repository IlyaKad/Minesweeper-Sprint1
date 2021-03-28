function randomMinesArray() {
    var sizeNums = gLevel.SIZE * gLevel.SIZE - 1;
    var nums = [];
    for (var i = 0; i < sizeNums; i++) {
        nums[i] = i;
    }
    shuffle(nums);
    return nums;
}

function shuffle(items) {
    var randIdx, keep, i;
    for (i = items.length - 1; i > 0; i--) {
        randIdx = getRandomInt(0, items.length - 1);

        keep = items[i];
        items[i] = items[randIdx];
        items[randIdx] = keep;
    }
    return items;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is inclusive and the minimum is inclusive 
}