function struktur(config = {}) {

    Array.prototype.extend = function (other_array) {
        /* You should include a test to check whether other_array really is an array */
        other_array.forEach(function (v) {
            this.push(v)
        }, this);
    };


    /**
     * The Struktur class. The whole logic that detects structure
     * in rendered HTML pages happens here.
     */
    class Struktur {

        constructor(config) {
            this.config = {
                N: 6,
                minWidth: 200,
                minHeight: 200,
                minWidthMin: 10,
                minHeightMin: 10,
                structureTags: ['div', 'article', 'p', 'section', 'span', 'aside', 'p', 'li', 'dd'],
                highlightStruktur: false,
                highlightContent: false,
                no_data_img_src: true,
                addClass: false,
            };

            Object.assign(this.config, config);
        }

        /**
         * Run struktur in the current DOM.
         */
        struktur() {
            let structures = this.findCandidates();
            var data = {};

            if (this.config.highlightStruktur) {
                for (let structure of structures) {
                    structure.forEach((node) => {
                       node.style.border = "3px solid rgb(0, 0, 0)";
                    });
                }
            }

            var structure_name;

            for (let s = 0; s < structures.length; s++) {
                let structure = structures[s];
                structure_name = 'structure_' + s;
                data[structure_name] = [];
                for (let node of structure) {
                    let parsed = this.parseContent(node);

                    if (this.config.highlightContent) {
                        parsed.forEach((obj) => {
                            let node = (obj.node.nodeType === 1) ? obj.node : obj.node.parentNode;
                            node.style.border = "1px solid rgb(255, 0, 0)";
                        });
                    }

                    // dont return the node
                    data[structure_name].push(parsed.map((el) => {
                        delete el.node; return el;
                    }));
                }
            }

            return data;
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

            var allElems = [];

            function acceptNodes(node) {
                return NodeFilter.FILTER_ACCEPT;
            }

            var treeWalker = document.createTreeWalker(
                document.body,
                NodeFilter.SHOW_ELEMENT,
                { acceptNode: acceptNodes },
                false
            );

            while(treeWalker.nextNode()) allElems.push(treeWalker.currentNode);

            var candidates = [];
            var found = [];

            for (let element of allElems) {
                if (element.childElementCount >= this.config.N) {
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
            var n, a = [], walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
            while (n = walk.nextNode()) {
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
                    let obj = {
                        'node': currentNode,
                        'href': link,
                        'linkText': currentNode.innerText.trim()
                    };
                    if (this.config.addClass) {
                        obj.class = currentNode.classList.toString();
                    }
                    this.parsed.push(obj);

                }
            }

            if (currentNode.tagName === 'IMG' && currentNode.hasAttribute('src')) {
                let src = currentNode.getAttribute('src');
                // not interested in data img
                if (this.config.no_data_img_src && src.startsWith('data:')) {
                    src = '';
                }
                var obj = {};
                if (currentNode.hasAttribute('alt')) {
                    obj = {
                        'node': currentNode,
                        'type': 'img',
                        'src': src,
                        'alt': currentNode.getAttribute('alt').trim(),
                    }
                } else {
                    obj = {
                        'node': currentNode,
                        'type': 'img',
                        'src': src
                    }
                }
                if (this.config.addClass) {
                    obj.class = currentNode.classList.toString();
                }

                if (obj.alt || obj.src) {
                    this.parsed.push(obj);
                }
            }

            if (currentNode.nodeType === 3 && !this.usedTextNodes.includes(currentNode)) {
                let parent = currentNode.parentElement;
                if (this.isVisible(parent)) {
                    let text = currentNode.data.trim();
                    if (text.length > 0) {
                        obj = {
                            'node': currentNode,
                            'text': currentNode.data.trim()
                        };
                        if (this.config.addClass) {
                            obj.class = currentNode.parentElement.classList.toString();
                        }
                        this.parsed.push(obj);
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

            function acceptNodes(node) {
                if (node.nodeType === 1 || node.nodeType === 3) {
                    return NodeFilter.FILTER_ACCEPT;
                } else {
                    return NodeFilter.FILTER_REJECT;
                }
            }

            var treeWalker = document.createTreeWalker(
                container,
                NodeFilter.SHOW_ALL,
                { acceptNode: acceptNodes },
                false
            );

            while(treeWalker.nextNode()) this.extractReadable(treeWalker.currentNode);

            return this.parsed;
        }

    }

    let struktur = new Struktur(config);
    return JSON.stringify(struktur.struktur(), null, 2);
}