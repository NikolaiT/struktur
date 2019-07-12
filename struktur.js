(() => {

    Array.prototype.extend = function (other_array) {
        /* You should include a test to check whether other_array really is an array */
        other_array.forEach(function(v) {this.push(v)}, this);
    };

    class Struktur {

        constructor(config) {
            this.config = {
                N: 6,
                minWidth: 200,
                minHeight: 200,
                minWidthMin: 10,
                minHeightMin: 10,
                structureTags: ['div', 'article', 'p', 'section', 'span', 'aside', 'p']
            };

            Object.assign(this.config, config);
        }

        /**
         * Run struktur in the current DOM.
         */
        struktur() {
            let structures = this.findCandidates();
            console.log(structures);
            let data = {};

            for (let s = 0; s < structures.length; s++) {
                let structure = structures[s];
                let structure_name = 'structure-' + s;
                data[structure_name] = [];
                for (let node of structure) {
                    let parsed = this.parseContent(node);
                    data[structure_name] = parsed;
                }
            }

            console.dir(data);
        }

        /**
         * Remove structures from the list with objects with zero parsed
         * information elements.
         *
         */
        filterStructures() {

        }

        /**
         * Find all candidates that are potentially containing a structure.
         *
         * @returns {Array}
         */
        findCandidates() {

            var allElems = document.body.getElementsByTagName('*');

            var candidates = [];
            var found = [];

            for (let element of allElems) {
                if (element.childElementCount > this.config.N) {
                    let child_tags = {};
                    for (var i = 0; i < element.childElementCount; i++) {
                        let tag = element.children[i].tagName.toLowerCase();
                        if (this.config.structureTags.includes(tag)) {
                            child_tags[tag] = child_tags[tag] ? child_tags[tag] + 1 : 1;
                        }
                    }

                    for (let tag in child_tags) {
                        if (child_tags[tag] > this.config.N) {
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
                    if (rect.width > this.config.minWidth) {
                        widths.push(rect.width);
                    }
                    if (rect.height > this.config.minHeight) {
                        heights.push(rect.height);
                    }
                }

                if (heights.length >= this.config.N && heights.every(e => e === heights[0])) {
                    found.push(children);
                }

                if (widths.length > this.config.N && widths.every(e => e === widths[0])) {
                    found.push(children);
                }
            }

            return found;
        }


        walkTheDOM(node, array) {
            array.push(node);
            node = node.firstChild;
            while (node) {
                this.walkTheDOM(node, array);
                node = node.nextSibling;
            }
        }


        /**
         *
         * Find all text nodes within node.
         * Source: https://stackoverflow.com/questions/10730309/find-all-text-nodes-in-html-page
         *
         * @param el
         * @returns {Array}
         */
        textNodesUnder(el) {
            var n, a=[], walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT,null,false);
            while(n = walk.nextNode()) {
                a.push(n);
            }
            return a;
        }


        /**
         * https://stackoverflow.com/questions/19669786/check-if-element-is-visible-in-dom
         *
         * @param elem
         * @returns {boolean} Whether the element is visible by the user.
         */
        isVisible(elem) {
            const style = getComputedStyle(elem);

            if (style.display === 'none') return false;

            if (style.visibility !== 'visible') return false;

            if (elem.offsetWidth + elem.offsetHeight + elem.getBoundingClientRect().height +
                elem.getBoundingClientRect().width === 0) {
                return false;
            }

            return true;
        }

        extractReadable(currentNode) {

            if (currentNode.tagName === 'A' && currentNode.hasAttribute('href')) {
                let link = currentNode.getAttribute('href');
                if (currentNode.innerText && currentNode.innerText.length > 0) {
                    this.usedTextNodes.extend(this.textNodesUnder(currentNode));
                    this.parsed.push({
                        'href': link,
                        'linkText': currentNode.innerText.trim()
                    });
                }
            }

            if (currentNode.tagName === 'IMG' && currentNode.hasAttribute('src')) {
                let src = currentNode.getAttribute('src');
                if (currentNode.hasAttribute('alt')) {
                    this.parsed.push({
                        'type': 'img',
                        'src': src,
                        'imgAlt': currentNode.getAttribute('alt').trim(),
                    })
                } else {
                    this.parsed.push({
                        'type': 'img',
                        'src': src
                    })
                }
            }

            if (currentNode.nodeType === 3 && !this.usedTextNodes.includes(currentNode)) {
                let parent = currentNode.parentElement;
                if (this.isVisible(parent)) {
                    let text = currentNode.data.trim();
                    if (text.length > 1) {
                        this.parsed.push({
                            'text': currentNode.data.trim()
                        });
                    }
                }
            }
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
        parseContent(container) {
            this.parsed = [];
            this.usedTextNodes = [];
            let allNodes = [];

            this.walkTheDOM(container, allNodes);

            for (let node of allNodes) {
                this.extractReadable(node);
            }

            return this.parsed;
        }

    }

    (new Struktur()).struktur();

})();