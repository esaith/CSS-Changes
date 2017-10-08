var esaith_CSSChanges = (function () {
    var deepEqual, diffString, removeComments, stageVersions, findDiff, result, getLastIndexOfNextSelectorAndProperties,
        parseProps;

    deepEqual = function (x, y) {
        if ((typeof x === "object" && x !== null) && (typeof y === "object" && y !== null)) {
            if (Object.keys(x).length !== Object.keys(y).length)
                return false;

            for (var prop in x) {
                if (y.hasOwnProperty(prop)) {
                    if (!deepEqual(x[prop], y[prop]))
                        return false;
                }
                else
                    return false;
            }

            return true;
        }
        else if (x !== y)
            return false;
        else
            return true;
    }

    diffString = function (original, modified) {
        var result;
        original = original.trim();
        modified = modified.trim();

        result = stageVersions(original, modified);
        result = findDiff(result);

        return result;
    }

    // Comments may come from the original file from the author
    // Comments may come from the modified file from css being removed
    removeComments = function (str) {
        var comment, beginIndex, endIndex;

        str = str.trim();

        beginIndex = str.indexOf('/*');

        while (beginIndex > -1) {
            endIndex = str.indexOf('*/') + 2; // to include the */

            comment = str.substring(beginIndex, endIndex);
            str = str.replace(comment, '').trim();

            beginIndex = str.indexOf('/*');
        }

        return str;
    };

    getLastIndexOfNextSelectorAndProperties = function (str) {
        var index, temp, numOpening, count, found, i;

        index = str.indexOf('}');
        temp = str.substring(0, index);
        numOpening = temp.split('{');

        if (numOpening.length === 2) {
            // If passes, this is a normal css selector. [0] is the selector, [1] are the properties
            return index;
        }

        // from here, counting brackets are needed. +1 for an opening bracket. -1 for a closing bracket.
        // Once 0 is reached all, the css selector and properties have been accounted for
        count = 0;
        found = false;

        for (index = 0; index < str.length; ++index) {
            if (str[index] === '{') {
                ++count;
                found = true;
            } else if (str[index] === '}') {
                --count;

                // Only break out if already found at least one opening bracket and have accounted for all other closing brackets for each opened bracket
                if (found && count === 0) {
                    break;
                } else if (!found && count < 0) {
                    // this shouldn't happen but good to send out to console about this oddity. Likely the css is screwed if it gets here
                    console.log('CSS likely have closing bracket before an opening bracket. Parsing of CSS selectors will likely be off');
                }
            }
        }

        return index;
    };

    parseProps = function (raw) {
        var result = {}, colonIndex, semiIndex, closingBracket;
        if (raw.length < 2) {
            return result;
        }

        raw = raw.trim();

        // Remove the first and trailing brackets.
        raw = raw.substring(1, raw.length - 1);

        colonIndex = raw.indexOf(':');
        semiIndex = raw.indexOf(';');
        semiIndex = semiIndex === -1 ? raw.length : semiIndex;

        while (raw.length > 0 && colonIndex !== -1) {
            prop = raw.substring(0, colonIndex).trim();
            value = raw.substring(colonIndex + 1, semiIndex).trim();

            if (prop && value) {
                result[prop] = value;
            }

            raw = raw.substring(semiIndex + 1).trim();
            colonIndex = raw.indexOf(':');
            semiIndex = raw.indexOf(';');
            semiIndex = semiIndex === -1 ? raw.length : semiIndex;
        }
        return result;
    };

    parseSource = function (str) {
        var rawCSS, lastBracketIndex, firstBracketIndex;
        var obj = {};

        while (str) {
            lastBracketIndex = getLastIndexOfNextSelectorAndProperties(str);
            rawCSS = str.substring(0, lastBracketIndex + 1).trim();  // +1 to include last bracket

            //Removes the recently pulled css selector and properties
            str = str.substring(lastBracketIndex + 1);   // +1 to remove the last '}' from the overall raw string

            firstBracketIndex = rawCSS.indexOf('{');
            selector = rawCSS.substring(0, firstBracketIndex);

            // Possible that / are randomly in css files. Verify they are not part of the css selector name
            selector = selector.replace(/\//g, '').trim();
            rawCSS = rawCSS.substring(firstBracketIndex);

            // Parse properties into objects
            if (rawCSS.indexOf('keyframes') === -1 && rawCSS.indexOf('@media') === -1) {
                props = parseProps(rawCSS)

                // Save property objects (ie, obj['#myDiv'] = { 'color': 'blue' }
                obj[selector] = props;
            } else {
				console.log('skipping parsing of raw css', rawCSS);				
			}
        }

        return obj;
    };

    stageVersions = function (original, modified) {
        var result;

        result = {}
        // Remove all comments to make things more consistent
        modified = removeComments(modified);

        // Remove all comments to make things more consistent
        original = removeComments(original);

        result.o = parseSource(original);
        result.m = parseSource(modified);
        return result;
    }

    findDiff = function (data) {
        var selector, modified, original, body, count, definition;

        body = '';

        modified = data.m;
        original = data.o;

        for (selector in original) {
            if (original.hasOwnProperty(selector)) {
                if (deepEqual(original[selector], modified[selector])) {
                    // no change recorded. Move along to the next property
                    original[selector] = null;
                    modified[selector] = null;
                }

                definition = '<div>' + selector + ' {</div><div><ul>';
                count = 0;
                for (prop in original[selector]) {
                    if (original[selector].hasOwnProperty(prop)) {
                        if (modified[selector] && original[selector] &&
                            (original[selector][prop] === modified[selector][prop] ||
                                (original[selector][prop] && original[selector][prop].indexOf('â') > -1) || (modified[selector][prop] && modified[selector][prop].indexOf('â') > -1))) {  // ignore any funky symbols 
                            definition += '<li>' + prop + ': ' + original[selector][prop] + ';</li>';
                        } else {
                            if (modified[selector] && modified[selector][prop]) {
                                definition += '<li class="original">/* ' + prop + ': ' + original[selector][prop] + '; */</li>';
                                definition += '<li class="modified">' + prop + ': ' + modified[selector][prop] + ';</li>';
                            } else {
                                definition += '<li class="removed">/* ' + prop + ': ' + original[selector][prop] + '; */</li>';
                            }
                            ++count;
                        }

                        if (modified[selector]) {
                            modified[selector][prop] = null;
                        }

                    }
                }

                // Check the modified selectors to rule out any added properties
                if (modified[selector] && modified[selector].hasOwnProperty(prop)) {
                    for (prop in modified[selector]) {
                        if (modified[selector].hasOwnProperty(prop) && modified[selector][prop] !== null) {
                            definition += '<li class="added">' + prop + ': ' + modified[selector][prop] + ';</li>';
                            ++count;
                            modified[selector][prop] = null;
                        }
                    }
                }
                // All properties on the selector have been checked for both original and modified css. Finish and push the definition onto the returning body
                body += count > 0 ? definition + '</ul></div><div>}</div>' : '';
            }
        }

        //*****  Modified Check  ****************  Anything left is likely new css selectors added by the developer
        for (selector in modified) {
            if (modified.hasOwnProperty(selector)) {
                definition = '<div>' + selector + ' {</div><div><ul>';
                count = 0;
                for (prop in modified[selector]) {
                    if (modified[selector].hasOwnProperty(prop) && modified[selector][prop] !== null) {
                        definition += '<li class="added">' + prop + ': ' + modified[selector][prop] + ';</li>';
                        ++count;
                    }
                }

                // All properties on the selector have been checked for both original and modified css. Finish and push the definition onto the returning body
                body += count > 0 ? definition + '</ul></div><div>}</div>' : '';
            }
        }

        return body.length > 0 ? body : '';
    }

    return {
        diffString: diffString,
        stageVersions: stageVersions,
        findDiff: findDiff,
        deepEqual: deepEqual,
        removeComments: removeComments,
        getLastIndexOfNextSelectorAndProperties: getLastIndexOfNextSelectorAndProperties,
        parseProps: parseProps
    };

})();

window.esaith_CSSChanges = esaith_CSSChanges;