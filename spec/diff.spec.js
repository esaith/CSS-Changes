describe('diff testing', function () {
    var ns;

    ns = window.esaith_CSSChanges;

    describe('removeComments testing', function () {
        it('expect not comments found. String should not be modified.', function () {
            var str = 'abc123', result;

            result = esaith_CSSChanges.removeComments(str);
            expect(result).toBe(str);
        });

        it('expect no comments found but spacing before and after. String should be trimmed', function () {
            var str = ' abc123 ', result;

            result = esaith_CSSChanges.removeComments(str);
            expect(result).toBe('abc123');
        });

        it('expects 1 comment. Removes comment from string', function () {
            var str = ' abc /*asdfasdf */ 123 ', result;

            result = esaith_CSSChanges.removeComments(str);
            expect(result).toBe('abc  123');
        });

        it('expects 2 comments and spacing before and afterwards. Removes comments from string', function () {
            var str = ' abc /*asdfasdf */123 /*asdfasdf */ ', result;

            result = esaith_CSSChanges.removeComments(str);
            expect(result).toBe('abc 123');
        });
    });

    describe('getNextSelectorAndProperties', function () {
        it('expect selector with 1 property', function () {
            var str, index;

            str = '#myId { color: blue; }';
            index = ns.getLastIndexOfNextSelectorAndProperties(str);
            expect(index).toBe(21)
        });

        it('expect selectors with 2 properties', function () {
            var str, index;

            str = '#myId { color: blue; text-align: center; }';
            index = ns.getLastIndexOfNextSelectorAndProperties(str);
            expect(index).toBe(str.length - 1);
        });

        it('expect 2 selectors with properties. Should return the first selector and its properties', function () {
            var str, index;

            str = '#myId { color: blue;}#myId2 { color: blue; text-align: center; }';
            index = ns.getLastIndexOfNextSelectorAndProperties(str);
            expect(index).toBe(20);
        });

        it('expect @keyframes that allow multiple open brackets prior to their first closed bracket.', function () {
            var str, index;

            str = '@-webkit-keyframes fadeOut { 0% { opacity: 1 } 100% { opacity: 0} }';
            index = ns.getLastIndexOfNextSelectorAndProperties(str);
            expect(index).toBe(str.length - 1);
        });

        it('expect @keyframes that allow multiple open brackets prior to their first closed bracket. Followed by other selectors', function () {
            var str, index;

            str = '@-webkit-keyframes fadeOut { 0% { opacity: 1 } 100% { opacity: 0} }#myId { color: blue;}#myId2 { color: blue; text-align: center; }';
            index = ns.getLastIndexOfNextSelectorAndProperties(str);
            expect(index).toBe(66);
        });
    });

    // Parses only the raw properties on the css selector. selector name already moved. Should be { ... } only.
    describe('parseProps tests', function () {
        it('expect an empty list. {}. Return an empty object', function () {
            var raw = '{}', result;

            result = ns.parseProps(raw);
            expect(ns.deepEqual(result, {})).toBe(true);
        });

        it('expect a simple property', function () {
            var raw = '{ color: blue; }', result;

            result = ns.parseProps(raw);
            expect(ns.deepEqual(result, { 'color': 'blue' })).toBe(true);
        });

        it('expect a simple property', function () {
            var raw = '{transform:translate3d(-14400%,0,0)}', result;

            result = ns.parseProps(raw);
            expect(ns.deepEqual(result, { 'transform': 'translate3d(-14400%,0,0)' })).toBe(true);
        });

        it('expect two simple property', function () {
            var raw = '{ color: blue; font-size: 16px;}', result;

            result = ns.parseProps(raw);
            expect(ns.deepEqual(result, { 'color': 'blue', 'font-size': '16px' })).toBe(true);
        });

        it('expect three properties.', function () {
            var raw = '{ color: blue; font-size: 16px; padding: 10px 10px 20px 10px; }', result;

            result = ns.parseProps(raw);
            expect(ns.deepEqual(result, { 'color': 'blue', 'font-size': '16px', 'padding': '10px 10px 20px 10px' })).toBe(true);
        });

        xit('expect webkit frame that has multiple opening and closing brackets', function () {
            var raw;
            //raw = '@-webkit-keyframes fadeOut { 0% { opacity: 1 } 100% { opacity: 0} }';
            raw = '{ 0% { opacity: 1 } 100% { opacity: 0} }';

            result = ns.parseProps(raw);
            expect(ns.deepEqual(result, { '0%': 'opacity: 1', '100%': 'opacity: 0' })).toBe(true)
        });

        xit('expect webkit frame that has multiple opening and closing brackets', function () {
            var raw, expected;
            //raw = '@-webkit-keyframes radomir{0%{opacity:1;-webkit-transform:scale3d(.4,.4,1);transform:scale3d(.4,.4,1)}80%{box-shadow:inset 0 0 0 2px rgba(255,255,255,.8);opacity:.1}100%{box-shadow:inset 0 0 0 2px rgba(250,255,255,.8);opacity:0;-webkit-transform:scale3d(1.2,1.2,1);transform:scale3d(1.2,1.2,1)}}'
            raw = '{0%{opacity:1;-webkit-transform:scale3d(.4,.4,1);transform:scale3d(.4,.4,1)}80%{box-shadow:inset 0 0 0 2px rgba(255,255,255,.8);opacity:.1}100%{box-shadow:inset 0 0 0 2px rgba(250,255,255,.8);opacity:0;-webkit-transform:scale3d(1.2,1.2,1);transform:scale3d(1.2,1.2,1)} }'

            result = ns.parseProps(raw);
            expected = { '0%': 'opacity:1;-webkit-transform:scale3d(.4,.4,1);transform:scale3d(.4,.4,1)', '80%': 'box-shadow:inset 0 0 0 2px rgba(255,255,255,.8);opacity:.1', '100%': 'box-shadow:inset 0 0 0 2px rgba(250,255,255,.8);opacity:0;-webkit-transform:scale3d(1.2,1.2,1);transform:scale3d(1.2,1.2,1)' };
            expect(ns.deepEqual(result, expected)).toBe(true)
        });

        

    });

    describe('parseSource tests', function () {
        it('expect empty css selector. Should return empty object', function () {
            var original = '', result, expected;

            result = parseSource(result, original);
            expected = {};
            expect(ns.deepEqual(expected, result)).toBe(true);
        });

        it('expect one css property', function () {
            var original, expected, result;

            original = '#myId { color: blue; }';
            expected = {
                '#myId': { 'color': 'blue' }
            };
            result = parseSource(original);
            expect(ns.deepEqual(expected, result)).toBe(true);
        });

        it('expect two css property', function () {
            var original, expected, result;
            original = '#myId { color: blue; text-align: center;}';
            expected = {
                '#myId': {
                    'color': 'blue',
                    'text-align': 'center'
                }
            };
            result = parseSource(original);
            expect(ns.deepEqual(expected, result)).toBe(true);
        });

        it('expect thee css property', function () {
            var original, expected, result;
            original = '#myId { background-src: url("www.aol.com"); color: blue; text-align: center;}';
            expected = {
                '#myId': {
                    'color': 'blue',
                    'text-align': 'center',
                    'background-src': 'url("www.aol.com")'
                }
            };
            result = parseSource(original);
            expect(ns.deepEqual(expected, result)).toBe(true);
        });
    });

    describe('tests if any diff has been found between css selectors', function () {
        it('expect both og and mod to be the same with no properties', function () {
            var data = {}, expected, result;

            data.o = data.m = {};
            result = ns.findDiff(data);

            expect(result).toBe('<div class="nochanges">No CSS changes noted</div>');
        });

        it('expects og and mod to have one css selector with 1 property that are the same. No output', function () {
            var data = {}, expected, result;
            data.o = { '#myId': { 'color': 'red' } };
            data.m = { '#myId': { 'color': 'red' } };
            result = ns.findDiff(data);
            expected = '<div class="nochanges">No CSS changes noted</div>';
            expect(result).toBe(expected);
        });

        it('expects og and mod to have one css selector with 1 property that has changed. No output', function () {
            var data = {}, expected, result;
            data.o = { '#myId': { 'color': 'red' } };
            data.m = { '#myId': { 'color': 'blue' } };
            result = ns.findDiff(data);
            expected = '<div>#myId {</div><div><ul><li class="original">/* color: red; */</li><li class="modified">color: blue;</li></ul></div><div>}</div>';
            expect(result).toBe(expected);
        });

        it('expects a css selector in both OG and MOD but adds a property', function () {
            var data = {}, expected, result;
            data.o = { '#myId': { 'color': 'red' } };
            data.m = { '#myId': { 'color': 'red', 'font-size': '15px' } };
            result = ns.findDiff(data);
            expected = '<div>#myId {</div><div><ul><li>color: red;</li><li class="added">font-size: 15px;</li></ul></div><div>}</div>';
            expect(result).toBe(expected);
        });

        it('expects a selector to be added', function () {
            var data = {}, expected, result;
            data.o = {};
            data.m = { '#myId': { 'color': 'red' } };
            result = ns.findDiff(data);
            expected = '<div>#myId {</div><div><ul><li class="added">color: red;</li></ul></div><div>}</div>';
            expect(expected).toBe(result);
        });

        it('expects a selector to be removed', function () {
            var data = {}, expected, result;
            data.o = { '#myId': { 'color': 'red' } };
            data.m = {};
            result = ns.findDiff(data);
            expected = '<div>#myId {</div><div><ul><li class="removed">/* color: red; */</li></ul></div><div>}</div>';
            expect(expected).toBe(result);
        });
        
        it('expects two selector to be added', function () {
            var data = {}, expected, result;
            data.o = {};
            data.m = { '#myId': { 'color': 'red' }, '#myId2': { 'color': 'red' } };
            result = ns.findDiff(data);
            expected = '<div>#myId {</div><div><ul><li class="added">color: red;</li></ul></div><div>}</div><div>#myId2 {</div><div><ul><li class="added">color: red;</li></ul></div><div>}</div>';
            expect(expected).toBe(result);
        });

        it('expects two selector to be removed', function () {
            var data = {}, expected, result;
            data.o = { '#myId': { 'color': 'red' }, '#myId2': { 'color': 'red' } };
            data.m = {};
            result = ns.findDiff(data);
            expected = '<div>#myId {</div><div><ul><li class="removed">/* color: red; */</li></ul></div><div>}</div><div>#myId2 {</div><div><ul><li class="removed">/* color: red; */</li></ul></div><div>}</div>';
            expect(expected).toBe(result);
        });

        it('expect one seletor removed, 3 added', function () {
            var data = {}, expected, result;
            data.o = {
                '#myId4': {
                    'background-color': 'blue',
                    'font-weight': '400'
                }
            };
            data.m = {
                '#myId': { 'color': 'red' },
                '#myID2': { 'color': 'blue', 'font-size': '10px' },
                '#myID11': { 'font-size': '14px' }
            };
            result = ns.findDiff(data);
            expected = '<div>#myId4 {</div><div><ul><li class="removed">/* background-color: blue; */</li><li class="removed">/* font-weight: 400; */</li></ul></div><div>}</div>' +
                        '<div>#myId {</div><div><ul><li class="added">color: red;</li></ul></div><div>}</div>' +
                        '<div>#myID2 {</div><div><ul><li class="added">color: blue;</li><li class="added">font-size: 10px;</li></ul></div><div>}</div>' +
                        '<div>#myID11 {</div><div><ul><li class="added">font-size: 14px;</li></ul></div><div>}</div>';
            expect(result).toBe(expected);
        });

        xit('expects a keyframe to be added', function () {
            var data = {}, expected, result;
            data.o = {};
            data.m = { '@-webkit-keyframes fadeOut': { '0%': 'opacity: 1', '100%': 'opacity: 0' } };
            result = ns.findDiff(data);
            expected = '<div>@-webkit-keyframes fadeOut {</div><div><ul><li class="added">0% { opacity: 1 } 100% { opacity: 0 }</li></ul></div><div>}</div>';
            expect(expected).toBe(result);
        });
        xit('expects a keyframe to be removed', function () {
            var data = {}, expected, result;
            data.o = { '@-webkit-keyframes fadeOut': { '0%': 'opacity: 1', '100%': 'opacity: 0' } };
            data.m = {};
            result = ns.findDiff(data);
            expected = '<div>@-webkit-keyframes fadeOut {</div><div><ul><li class="removed">/* 0% { opacity: 1 } 100% { opacity: 0 } */</li></ul></div><div>}</div>';
            expect(expected).toBe(result);
        });
        xit('expects a keyframe to change values', function () {
            var data = {}, expected, result;
            data.o = { '@-webkit-keyframes fadeOut': { '0%': 'opacity: 1', '100%': 'opacity: 0' } };
            data.m = { '@-webkit-keyframes fadeOut': { '0%': 'opacity: .5', '100%': 'opacity: 0' } };
            result = ns.findDiff(data);
            expected = '<div>@-webkit-keyframes fadeOut {</div><div><ul><li class="original">/* 0% { opacity: 1 } 100% { opacity: 0 } */</li><li class="modified">0% { opacity: .5 } 100% { opacity: 0 }</li></ul></div><div>}</div>';
            expect(expected).toBe(result);
        });
    });
});
