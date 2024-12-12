export function checkSimilarEleInArr(arr) {
  let set = new Set();
  for (let item of arr) {
    const itemLowerCase = item.toLowerCase();
    if (set.has(itemLowerCase)) return true;
    set.add(itemLowerCase);
  } 
  return false;
}
