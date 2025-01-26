chrome.runtime.onMessage.addListener((data, sender, sendResponse) => {
    if (data.msg === 'do-scraping') {
        DoScrape();
    }
});

let timerId;
async function DoScrape() {
    // Create a notifier element
    let notifier_el = document.createElement("div");
    notifier_el.style.zIndex = 999;
    notifier_el.style.backgroundColor = "#A40F4EFF";
    notifier_el.style.color = "#ffffff";
    notifier_el.style.position = "fixed";
    notifier_el.style.left = "12px";
    notifier_el.style.top = "12px";
    notifier_el.style.width = "340px";
    notifier_el.style.fontSize = "x-small";
    notifier_el.style.padding = "6px 10px 6px 10px";
    notifier_el.style.border = "5px solid rgb(255, 208, 0)";
    notifier_el.style.borderRadius = "7px";
    notifier_el.innerHTML = "Instagram Comment Scraper (by v-User) <br/> Scraping process started...";
    console.log("Scraping process started...");
    document.body.insertBefore(notifier_el, document.body.firstChild);

    let all_comments_info = "";
    const loading_el = document.querySelector("[data-visualcompletion=loading-state],[role=progressbar]");
    let commentElements = document.querySelectorAll("[role=main] ul li div:not([role]) span");

    if (loading_el && commentElements.length > 0) {
        await doLoading();
        console.log("Comments are loaded");
        commentElements = document.querySelectorAll("[role=main] ul li div:not([role]) span");

        let uniqueComments = new Set();

        try {
            commentElements.forEach(function (el) {
                const commentText = el.textContent.trim();
                if (!uniqueComments.has(commentText)) {
                    uniqueComments.add(commentText);
                    all_comments_info += commentText + "\r\n";
                }
            });
        } catch (e) {
            console.error("Error while processing comments:", e);
        }

        const commentCount = uniqueComments.size;
        const commentInfo = `Found ${commentCount} unique comments`;
        console.log(commentInfo);
        notifier_el.innerHTML = `Instagram Comment Scraper (by v-User) <br/> Scraping process finished and found ${commentCount} unique comments.`;
        console.log("Scraping process finished.");

        // Save as a text file
        let fileName = "Comments scraped by vUser";
        fileName = fileName.replace(/[\/\\?%*:|"<>.]/g, '-'); // Remove illegal chars from the file name
        const uri = "data:text/plain;charset=utf-8," + encodeURIComponent(all_comments_info);
        let downloadLink = document.createElement("a");
        downloadLink.href = uri;
        downloadLink.download = fileName;
        document.body.appendChild(downloadLink);
        downloadLink.click();
    } else {
        notifier_el.style.backgroundColor = "#ad0000";
        notifier_el.innerHTML = "Instagram Comment Scraper (by v-User) <br/> Error: Comments are not visible!";
        console.log("Error: Comments are not visible!");
    }
}

function doLoading() {
    return new Promise(resolve => {
        timerId = setInterval(function () {
            let loading_el = document.querySelector("[data-visualcompletion=loading-state],[role=progressbar]");
            if (loading_el) {
                loading_el.scrollIntoView();
                let comments = document.querySelectorAll("[role=main] ul li div:not([role]) span");
                if (comments.length > 700) {
                    clearInterval(timerId);
                    resolve();
                }
            } else {
                let hiddenComments = "";
                if (document.querySelector("[aria-label='View hidden comments']")) {
                    hiddenComments = document.querySelector("[aria-label='View hidden comments']").parentElement.querySelector("[role=button]");
                }
                if (hiddenComments) {
                    hiddenComments.click();
                } else {
                    clearInterval(timerId);
                    resolve();
                }
            }
        }, 1500);
    });
}

function waitForElm(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }
        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}
