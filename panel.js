var getOriginalSelectedFile, found, count;

function getCSSResources(originalStyleSheets) {
    var sheets = [], additional = [];
    found = false;
    count = 0;

    chrome.devtools.inspectedWindow.getResources(function (resources) {
        var div;
        sheets = [], totalSheets = 0;
        div = document.querySelector('#styles');
        div.innerHTML = '';
        resources.forEach(function (element) {
            if (element.type === 'stylesheet' && element.url) {
                sheets.push(element);

                element.getContent(function (content, encoding) {
                    if (element.url && element.url.indexOf('.css') > -1) {
                        // request context script to get css files. These files should only be requested and saved in storage for retrieval and next page refresh



                        getOriginalSelectedFile(element.url, content, originalStyleSheets);
                        ++totalSheets;
                    } else if (element.url && element.url.indexOf('inspector-stylesheet') > -1) {
                        div.innerHTML += '<br><div style="font-weight: 600; font-size: 16px; text-decoration: underline;">MANUALLY ENTERED</div>';
                        div.innerHTML += esaith_CSSChanges.diffString('', content);
                    }
                });
            } else if (element.type === 'document' && element.url) {
                additional.push(element)
            }
        });
    });
}

getOriginalSelectedFile = function (url, modifiedCSS, originalStyleSheets) {
    var originalCSS, i;

    for (i = 0; i < originalStyleSheets.length; ++i) {
        if (originalStyleSheets[i].url === url && originalStyleSheets[i].content) {
            originalCSS = originalStyleSheets[i].content.content;
            break;
        }        
    }

    if (!originalCSS) {
        return;
    }

    console.log('able to find original style sheet for', url);

    // remove all carriage returns that may affect parsing
    originalCSS = originalCSS.replace(/\r?\n|\r/g, '');
    modifiedCSS = modifiedCSS.replace(/\r?\n|\r/g, '');
    ++count;
   
    div = document.querySelector('#styles');
    diff = esaith_CSSChanges.diffString(originalCSS, modifiedCSS);
    if (diff) {
        div.innerHTML += '<div class="section"><br>' + url + '<br>' + diff + '</div>';
        found = true;
    }

    if (count === originalStyleSheets.length && !found) {
        // Only show a large massive 'No Changes Found' message if no changes have been seen on any files
        div.innerHTML = '<div class="nochanges">No CSS changes noted</div>';
    }

    console.log('CSS Changes: Successfully downloaded and compared: ' + url);
}