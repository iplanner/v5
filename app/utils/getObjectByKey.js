export function getObjectByKey(arr, key, value){
    for (let i = 0; i < arr.length; i++) {
        if (arr[i][key] === value) {
            return arr[i];
        }
    }
    return null;
};

/*
const arr = [
  { name: 'Alice', info: { age: 30 } },
  { name: 'Bob', info: { age: 25 } },
  { name: 'Charlie', info: { age: 28 } }
];

const foundObject = getObjectByKey(arr, 'name', 'Allice');
console.log(foundObject); // Output: { name: 'Alice', info: { age: 30 } }

*/