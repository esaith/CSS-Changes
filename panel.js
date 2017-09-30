var div, getOriginalSelectedFile, count = 0, totalSheets, found;

function getCSSResources() {
    var sheets = [], count = 0, additional = [], found = false;

    chrome.devtools.inspectedWindow.getResources(function (resources) {
        sheets = [], totalSheets = 0;
        div = document.querySelector('#styles');
        div.innerHTML = '';
        resources.forEach(function (element) {
            if (element.type === 'stylesheet' && element.url) {
                sheets.push(element);

                element.getContent(function (content, encoding) {
                    if (element.url && element.url.indexOf('.css') > -1) {
                        getOriginalSelectedFile(element.url, content);
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

getOriginalSelectedFile = function (url, modifiedCSS) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        var originalCSS;
        if (xhr.readyState === 4 && xhr.status === 200) {
            originalCSS = xhr.responseText;

            // remove all carriage returns that may affect parsing
            originalCSS = originalCSS.replace(/\r?\n|\r/g, '');
            modifiedCSS = modifiedCSS.replace(/\r?\n|\r/g, '');
            ++count;

            diff = esaith_CSSChanges.diffString(originalCSS, modifiedCSS);
            if (diff) {
                div.innerHTML += '<div class="section"><br>' + url + '<br>' + diff + '</div>';
                found = true;
            }

            if (count === totalSheets && !found) {
                // Only show a large massive 'No Changes Found' message if no changes have been seen on any files
                div.innerHTML = '<div class="nochanges">No CSS changes noted</div>';
            }

            console.log('CSS Changes: Successfully downloaded and compared: ' + url);
        }
    }

    xhr.open("GET", url, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    try {
        xhr.send();
    } catch (error) {
        console.log("Failed to get file: " + url, ex);
    }
}