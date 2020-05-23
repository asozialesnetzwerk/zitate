var rating = "https://raw.githubusercontent.com/asozialesnetzwerk/zitate/master/bewertung_zitate.json"
var inputfield = "2271-656";

window.q = [];
window.r = [];

var getQuote = function(data) {
    q.push(data.split(/\n/));
    if(window.q.length==2 && window.r.length==1) createZitat();
};
var getRating = function(data) {
    r.push(JSON.parse(data));
    if(window.q.length==2 && window.r.length==1) createZitat();
};

$.get(rating, getRating, 'text');

$(".get-quote").on("click", function() {
    createZitat();
});

function createZitat()
{
    var a = Math.floor(Math.random() * window.q[0].length);
    var q = Math.floor(Math.random() * window.q[1].length);
    var z = inputfield; //Zitat-ID
    
    $(".quote-id").text(z);
    $(".quote-rating").text("Rating: "+window.r[0][z]);
}

function myQuoteStats() {
  inputfield = document.getElementById("myQuote").value;
  alert(inputfield);
  createZitat()
}
















var author="579"


//alert(ratingJson);
alert("HI");

var arr =
{"1075-162":-1,
"184-304":0,
"837-765":1,
"1798-17":-1,
"1387-579":-1,
"2624-790":1,
"LOL-579":7,
"2694-523":0,
"492-498":0,
"12-579":7,
"1404-517":0}


var keys = Object.keys(arr);
console.log(keys)

console.log(keys.filter(s=>~s.indexOf("-"+author)));
var rip = keys.filter(s=>~s.indexOf("-"+author)); //contain author

var newarr = {};
for (let [key, value] of Object.entries(rip)) {
    newarr[`"${value}"`] =arr[`${value}`];
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
