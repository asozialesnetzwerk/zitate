let WikiquoteApi = (function() {

    let wqa = {};

    let API_URL = "https://de.wikiquote.org/w/api.php";

    /**
     * Query based on "titles" parameter and return page id.
     * If multiple page ids are returned, choose the first one.
     * Query includes "redirects" option to automatically traverse redirects.
     * All words will be capitalized as this generally yields more consistent results.
     */
    wqa.queryTitles = function(titles, success, error) {
        $.ajax({
            url: API_URL,
            dataType: "jsonp",
            data: {
                format: "json",
                action: "query",
                redirects: "",
                titles: titles
            },

            success: function(result, status) {
                let pages = result.query.pages;
                let pageId = -1;
                for(let p in pages) {
                    let page = pages[p];
                    // api can return invalid recrods, these are marked as "missing"
                    if(!("missing" in page)) {
                        pageId = page.pageid;
                        break;
                    }
                }
                if(pageId > 0) {
                    success(pageId);
                } else {
                    error("No results");
                }
            },

            error: function(xhr, result, status){
                error("Error processing your query");
            }
        });
    };

    /**
     * Get the sections for a given page.
     * This makes parsing for quotes more manageable.
     * Returns an array of all "1.x" sections as these usually contain the quotes.
     * If no 1.x sections exists, returns section 1. Returns the titles that were used
     * in case there is a redirect.
     */
    wqa.getSectionsForPage = function(pageId, success, error) {
        $.ajax({
            url: API_URL,
            dataType: "jsonp",
            data: {
                format: "json",
                action: "parse",
                prop: "sections",
                pageid: pageId
            },

            success: function(result, status){
                let sectionArray = [];
                let sections = result.parse.sections;
                for(let s of sections) {
                    if (s.line !== "Weblinks" && s.line !== "Quellen") {
                        sectionArray.push(s.index);
                    }
                }
                // Use section 1 if there are no "1.x" sections
                if(sectionArray.length === 0) {
                    sectionArray.push("1");
                }
                success({ titles: result.parse.title, sections: sectionArray });
            },
            error: function(xhr, result, status){
                error("Error getting sections");
            }
        });
    };

    /**
     * Get all quotes for a given section.  Most sections will be of the format:
     * <h3> title </h3>
     * <ul>
     *   <li>
     *     Quote text
     *     <ul>
     *       <li> additional info on the quote </li>
     *     </ul>
     *   </li>
     * <ul>
     * <ul> next quote etc... </ul>
     *
     * The quote may or may not contain sections inside <b /> tags.
     *
     * For quotes with bold sections, only the bold part is returned for brevity
     * (usually the bold part is more well known).
     * Otherwise the entire text is returned.  Returns the titles that were used
     * in case there is a redirect.
     */
    wqa.getQuotesForSection = function(pageId, sectionIndex, success, error) {
        $.ajax({
            url: API_URL,
            dataType: "jsonp",
            data: {
                format: "json",
                action: "parse",
                noimages: "",
                pageid: pageId,
                section: sectionIndex
            },

            success: function(result, status){
                let quotes = result.parse.text["*"];
                let quoteArray = []

                // Find top level <li> only
                let $lis = $(quotes).find('li:not(li li)');
                $lis.each(function() {
                    // Remove all children that aren't <b>

                    let $bolds = $(this).find('b');

                    // If the section has bold text, use it.  Otherwise pull the plain text.
                    let text;
                    if($bolds.length > 0) {
                        text = $bolds.html();
                    } else {
                        text = $(this).html();
                    }
                    const strArr = [];
                    let inTag = false;
                    for (let i = 0; i < text.length; i++) {
                        const ch = text.charAt(i);
                        if (ch === "<") {
                           inTag = true;
                        } else if (ch === ">") {
                            inTag = false;
                        } else if (!inTag) {
                            strArr.push(ch);
                        }
                    }
                    quoteArray.push(strArr.join(""));
                });
                success({ titles: result.parse.title, quotes: quoteArray });
            },
            error: function(xhr, result, status){
                error("Error getting quotes");
            }
        });
    };

    /**
     * Search not using opensearch api. Returns an array of search results.
     */
    wqa.openSearch = function(titles, success, error) {
        $.ajax({
            url: API_URL,
            dataType: "jsonp",
            data: {
                format: "json",
                action: "query",
                list: "search",
                srsearch: titles
            },

            success: function(result, status){
                success(result.query.search);
            },
            error: function(xhr, result, status){
                error("Error with opensearch for " + titles);
            }
        });
    };

    /**
     * Capitalize the first letter of each word
     */
    wqa.capitalizeString = function(input) {
        let inputArray = input.split(' ');
        let output = [];
        for(s in inputArray) {
            output.push(inputArray[s].charAt(0).toUpperCase() + inputArray[s].slice(1));
        }
        return output.join(' ');
    };

    return wqa;
}());
