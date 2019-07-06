$(document).ready(function () {
    // Setting a reference to the article-container div where all the dynamic content will go
    // Adding event listeners to any dynamically generated "comment article"
    // and "scrape new article" buttons
    let articleContainer = $(".article-container")
    $(document).on("click", ".btn.comment", handleArticleComment);
    $(document).on("click", ".scrape-new", handleArticleScrape);

    // Once the page is ready, run the initPage function to kick things off
    initPage();

    function initPage() {
        articleContainer.empty();
        $.get("/api/articles?commented=false")
            .then(function (data) {
                if (data && data.length) {
                    renderArticles(data);
                }
                else {
                    renderEmpty();
                }
            })
    }

    function renderArticles(articles) {
        let articlePanels = [];
        for (let i = 0; i < articles.length; i++) {
            articlePanels.push(createPanel(articles[i]));
            // console.log(articles._id)
        }
        articleContainer.append(articlePanels);
    }

    function createPanel(article) {
        // This function takes in a single JSON object for an article
        // It construction a jQuery element containing all of the formatted HTML for the
        // article panel
        let panel =
            $(["<div class='panel panel-default mt-3'>",
                "<div class='panel-heading'>",
                "<h3>",
                article.article,
                "<a class='btn btn-success comment'>",
                "Comment Article",
                "</a>",
                "</h3>",
                "</div>",
                "<div class='panel-body'>",
                article.summary,
                "</div>",
                "</div>",
            ].join(""));
        // We attach the article's id to the jQuery element
        // We will use this when trying to figure out which article the user wants to comment)
        panel.data("_id", article._id);
        // return the constructed panel jQuery element
        return panel;
    }

    function renderEmpty() {
        // This function renders some HTML to the page explaining we don't have any articles to view
        // Using a joined array of HTML string data because it's easier to read/change than a 
        // concatenated string
        let emptyAlert =
            $(["<div class='alert alert-warning text-center'>",
                "<h4>Uh Oh.  Looks like we don't have any new articles.</h4>",
                "</div>",
                "<div class='panel panel-default'>",
                "<div class='panel-heading text-center'>",
                "<h3>What Would You Like To Do?</h3>",
                "</div>",
                "<div class='panel-body text=center'>",
                "<h4><a class='scrape-new'>Try Scraping New Articles</a></h4>",
                "<h4><a href='/saved'>Go to Saved Articles</a></h4>",
                "</div>",
                "</div>",
            ].join(""));
        // Appending this data to the page
        articleContainer.append(emptyAlert);
    }

    function handleArticleComment() {
        console.log("handling comment initiated")
        // Triggered when user wants to comment on an article
        // when we rendered the article initially, we attached a javascript object containing the headline id
        // to the element using the .data method.  Here we retrieve that.
        let articleToComment = $(this).parents(".panel").data();
        articleToComment.commented = true;
        // Using a patch method to be semantic since this is an update to an existing recorrd in our collection
        $.ajax({
            method: "PATCH",
            url: "api/articles",
            data: articleToComment
        })
            .then(function (data) {
                // If successful, mongoose will send back an object containing a key of "ok" with the value of 1
                // (which casts to 'true')
                if (data.ok) {
                    // Run the initPage function again.  This will reload the entire list of articles
                    initPage()
                }
            })
    }

    function handleArticleScrape() {
        console.log("handling scrape")
        $.get("/api/fetch")
            .then(function (data) {
                // If we are able to successfully scrape the macrumors and compare the articles to those
                // already in our collection, re render the articles on page
                // and let the user know how many unique articles we were able to save
                initPage();
                alert(data.message);
            })
    }
})