var getQuote = function() {
  var quotes;
  var authors;
  var ratings;
  var id = "";

  fetch("https://raw.githubusercontent.com/asozialesnetzwerk/zitate/master/namen.txt")
      .then(response => response.text())
      .then((data) => {
         authors = data.split('\n');
  })
  fetch("https://raw.githubusercontent.com/asozialesnetzwerk/zitate/master/zitate.txt")
      .then(response => response.text())
      .then((data) => {
         var qoutes = data.split('\n');
  })

  fetch("https://raw.githubusercontent.com/asozialesnetzwerk/zitate/master/bewertung_zitate.json")
      .then(response => response.text())
      .then((data) => {
         var ratings = data;
  })

  var quoteAuthor;
  var quoteText;

  do {
    var rnd = random() * qoutes.length;
    id = rnd;
    quoteText = qoutes[rnd]

    rnd = random() * authors.length;
    id = id + '-' + rnd;
    quoteAuthor = authors[rnd]

  } while(ratings.get(id) < 1)

  
  $(".quote-text").text(quoteText);
  $(".quote-author").text("- " + quoteText);
  $("#tweet").attr("href", "https://twitter.com/intent/tweet?text=" + encodeURIComponent('"' + quoteText + '"' + ' - ' +  quoteAuthor));
};

//Für das erste Zitat, welches immer dasselbe ist.
var firstQuote = "Da hat das rote Pferd sich einfach umgekehrt und hat mit seinem Schwanz die Fliege abgewehrt.";
var firstAuthor = "Johann Wolfgang von Goethe";

$(".tweet").attr("href", "https://twitter.com/intent/tweet?text=" + encodeURIComponent('"' + firstQuote + '"' + ' - ' + firstAuthor));

$(".get-quote").on("click", function() {
	getQuote();
});
