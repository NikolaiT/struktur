(() => {

    function findCandidates() {
        const N = 5;
        const minWidth = 200;
        const minHeight = 200;
        const structure_tags = ['div', 'article', 'p', 'section', 'span', 'aside', 'p'];

        var allElems = document.body.getElementsByTagName('*');

        var candidates = [];
        var found = [];

        for (let element of allElems) {
            if (element.childElementCount > N) {
                let child_tags = {};
                for (var i = 0; i < element.childElementCount; i++) {
                    let tag = element.children[i].tagName.toLowerCase();
                    if (structure_tags.includes(tag)) {
                        child_tags[tag] = child_tags[tag] ? child_tags[tag] + 1 : 1;
                    }
                }

                for (let tag in child_tags) {
                    if (child_tags[tag] > N) {
                        candidates.push({
                            'node': element,
                            'tag': tag,
                        })
                    }
                }
            }
        }

        // remove objects of candidates that do not visually align
        // horizontally or vertically
        for (let candidate of candidates) {

            var children = Array.from(candidate.node.children);
            children = children.filter((child) => {
                return child.tagName.toLowerCase() === candidate.tag;
            });

            var heights = [];
            var widths = [];

            for (let child of children) {
                var rect = child.getBoundingClientRect();
                if (rect.width > minWidth) {
                    widths.push(rect.width);
                }
                if (rect.height > minHeight) {
                    heights.push(rect.height);
                }
            }

            if (heights.length > 0 && heights.every(e => e === heights[0])) {
                found.push(children);
            }

            if (widths.length > 0 && widths.every(e => e === widths[0])) {
                found.push(children);
            }
        }

        return found;
    }


    /*
     * Parses visible content in the single elements of the found structure.
     *
     * What is content?
     *
     * Every semantic tag such as span, a, em, strong, time, small
     * where o.children.length == 0 and with o.innerText
     *
     * Check that the style.display attribute is not set to 'none'
     *
     */
    function parseContent(container) {

        var parsed = [];

        function walkTheDOM(node, func) {
            func(node);
            node = node.firstChild;
            while (node) {
                walkTheDOM(node, func);
                node = node.nextSibling;
            }
        }

        function extractReadable(currentNode) {

            if (currentNode.tagName === 'A' && currentNode.hasAttribute('href')) {
                let link = currentNode.getAttribute('href');
                if (currentNode.innerText && currentNode.innerText.length > 0) {
                    parsed.push({
                        'href': link,
                        'linkText': currentNode.innerText.trim()
                    })
                } else {
                    // parsed.push({
                    //     'href': link
                    // })
                }
            }

            if (currentNode.tagName === 'IMG' && currentNode.hasAttribute('src')) {
                let src = currentNode.getAttribute('src');
                if (currentNode.hasAttribute('alt')) {
                    parsed.push({
                        'type': 'img',
                        'src': src,
                        'imgAlt': currentNode.getAttribute('alt').trim(),
                    })
                } else {
                    parsed.push({
                        'type': 'img',
                        'src': src
                    })
                }
            }

            if (currentNode.nodeType === 3) {
                let text = currentNode.data.trim();
                if (text.length > 1) {
                    parsed.push({
                        'text': currentNode.data.trim()
                    });
                }
            }

        }

        walkTheDOM(container, extractReadable);

        return parsed;
    }


    let structures = findCandidates();
    console.log(structures);

    // run everything
    let data = [];
    for (var s = 0; s < structures.length; s++) {
        let structure = structures[s];
        let structure_name = 'structure-'+s;
        data[structure_name] = [];
        for (let node of structure) {
            data[structure_name].push(parseContent(node));
        }
    }

    console.dir(data);
    //console.log(JSON.stringify(data, null, 2));

})();