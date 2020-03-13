function fetchData(url) {
    return fetch(url)
            .then(response =>
                response.text().then(text => text.split(/\n/)));
}

var getQuote = function() {

    
    fetchData('https://raw.githubusercontent.com/asozialesnetzwerk/zitate/master/namen.txt').then(arr => {
        $(".quote-author").text("- " + arr[Math.floor(Math.random() * arr.length)]);
    } );
    
    fetchData('https://raw.githubusercontent.com/asozialesnetzwerk/zitate/master/zitate.txt').then(arr => {
        $(".quote-text").text(arr[Math.floor(Math.random() * arr.length)]);
    } );
	
 $("#tweet").attr("href", "https://twitter.com/intent/tweet?text=" + encodeURIComponent($(".quote-text").text()+ ' ' +  $(".quote-author").text()));

    
  // $("#tweet").attr("href", "https://twitter.com/intent/tweet?text=" + encodeURIComponent('"' + data.quoteText + '"' + ' - ' +  data.quoteAuthor));
};

$("#tweet").attr("href", "https://twitter.com/intent/tweet?text=" + encodeURIComponent($(".quote-text").text()+ ' ' +  $(".quote-author").text()));


// $(".tweet").attr("href", "https://twitter.com/intent/tweet?text=" + encodeURIComponent('"' + firstQuote + '"' + ' - ' + firstAuthor));

getQuote();
$(".get-quote").on("click", function() {
	getQuote();
});
