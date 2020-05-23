var rating = "https://raw.githubusercontent.com/asozialesnetzwerk/zitate/master/bewertung_zitate.json"




var author="579"

alert(rating);

document.getElementById("myRating").textContent=rating;


var keys = Object.keys(rating);
console.log(keys)

console.log(keys.filter(s=>~s.indexOf("-"+author)));
var rip = keys.filter(s=>~s.indexOf("-"+author)); //contain author

var newarr = {};
for (let [key, value] of Object.entries(rip)) {
    newarr[`"${value}"`] =rating[`${value}`];
}

console.log(newarr);
console.log(Object.values(newarr));

console.log(Math.max(...Object.values(newarr))); //max


//console.log(Object.keys(newarr).find(key => newarr[key] === 7)); //only one result


for (let [key, value] of Object.entries(newarr)) {
    if(`${value}` == Math.max(...Object.values(newarr)))
  {
      //console.log(`${key}`);
    console.log(`${key}`.substring(1, `${key}`.indexOf('-')));
  }
}  
