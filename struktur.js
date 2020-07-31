/**
 MIT License

 Copyright (c) 2019 Nikolai Tschacher (incolumitas.com)

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */


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
                minWidth: 200, // the minimum width of a potential structure candidate
                minHeight: 100, // the minimum height of a potential structure candidate
                structureTags: ['div', 'article', 'p', 'section', 'span', 'aside', 'p', 'li', 'dd'], // allowed nodeNames for structure candidates
                highlightStruktur: false, // add a border around structures
                highlightContent: false, // add border around found nodes within structure objects
                noDataImgSrc: true,
                addClass: false, // add class to the found visible nodes within structures
                fulltext: false, // whether to get the textContent of the full structure element instead of parsing each text node individually
                onlyObjectsWithLinks: true, // only include objects in structures that have at least a link with text
                errorMargin: 0.125, // the error margin in % where objects are still considered to be within a structure
            };

            Object.assign(this.config, config);
        }

        /**
         * Run struktur in the current DOM.
         */
        struktur() {
            let startTime = new Date();
            let structures = this.findCandidates();
            console.log(structures);
            var data = {};
            var structure_name;

            // parse and filter structures
            var s;
            for (s = 0; s < structures.length; s++) {
                let structure = structures[s];
                structure_name = 'structure_' + s;
                data[structure_name] = [];
                for (let node of structure) {
                    let object = this.parseContent(node);

                    if (object.length > 0 && this.filterObject(object)) {
                        if (this.config.highlightStruktur) {
                            node.style.border = "3px solid rgb(0, 0, 0)";
                        }
                        data[structure_name].push(object);
                    }
                }

                if (!this.filterStructure(data[structure_name])) {
                    delete data[structure_name];
                }
            }

            let endTime = new Date();

            data.numCandidateStructures = structures.length;
            data.timeElapsed = endTime - startTime;
            return data;
        }

        /**
         * Remove structures from the list with objects with zero parsed
         * information elements.
         *
         * @param structure the structure to test
         * @returns: true if the structure passes all filters, false otherwise
         *
         */
        filterStructure(structure) {

            for (let object of structure) {
                if (object.length === 0) {
                    return false;
                }
            }

            return true;
        }

        /**
         * filter based on elements within a structure object
         *
         * @param object the object to filter
         * @returns: true if the object passes all filters, false otherwise
         */
        filterObject(object) {
            var objectContainsLinkWithText = false;
            for (let content of object) {
                if (content.type === 'linkWithText' && content.linkText && content.linkText.length > 0) {
                    objectContainsLinkWithText = true;
                }
            }

            if (this.config.onlyObjectsWithLinks && !objectContainsLinkWithText) {
                return false;
            }

            return true;
        }

        /**
         * Check that the numbers are in a certain error margin from the average.
         *
         * This is not the best statistical solution, but it works for now.
         *
         */
        inRange(numbers) {
            let avg = numbers.reduce((a, b) => {return a + b}) / numbers.length;

            for (let num of numbers) {
                let delta = Math.abs(num - avg);
                if (delta/avg >= this.errorMargin) {
                    return false;
                }
            }

            return true;
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

            // find parents with at least N children with the same tag name
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
                        if (child_tags[tag] >= this.config.N) {
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
            // allow a error of 10% or so of the average height/width
            for (let candidate of candidates) {

                var children = Array.from(candidate.node.children);
                children = children.filter((child) => {
                    return child.tagName.toLowerCase() === candidate.tag;
                });

                var heights = [];
                var widths = [];

                for (let child of children) {
                    var rect = child.getBoundingClientRect();
                    if (rect.width > this.config.minWidth && rect.height > 0) {
                        widths.push(rect.width);
                    }
                    if (rect.height > this.config.minHeight && rect.width > 0) {
                        heights.push(rect.height);
                    }
                }

                if (heights.length >= this.config.N && this.inRange(heights)) {
                    found.push(children);
                }

                if (widths.length > this.config.N && this.inRange(widths)) {
                    found.push(children);
                }
            }

            return found;
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

        /**
         * Extracts readable content from currentNode
         *
         * There are essentially three objects of interest to the user:
         *
         * - Link with text
         * - Images with a src
         * - Visible text
         *
         * @param currentNode
         */
        extractReadable(currentNode) {
            if (currentNode.tagName === 'A' && currentNode.hasAttribute('href')) {
                let link = currentNode.getAttribute('href');
                let text = currentNode.innerText; // we only want visible text here!
                if (text && text.length > 0) {
                    this.usedTextNodes.extend(this.textNodesUnder(currentNode));
                    let obj = {
                        'type': 'linkWithText',
                        'href': link,
                        'linkText': text.trim()
                    };
                    if (this.config.addClass) {
                        obj.class = currentNode.classList.toString();
                    }
                    if (this.config.highlightContent) {
                        currentNode.style.border = "1px solid rgb(255, 0, 0)";
                    }
                    this.parsed.push(obj);
                }
            }

            if (currentNode.tagName === 'IMG' && currentNode.hasAttribute('src')) {
                let src = currentNode.getAttribute('src');
                // not interested in data img
                if (this.config.noDataImgSrc && src.startsWith('data:')) {
                    src = '';
                }
                var obj = {};
                if (currentNode.hasAttribute('alt')) {
                    obj = {
                        'type': 'img',
                        'src': src,
                        'alt': currentNode.getAttribute('alt').trim(),
                    }
                } else {
                    obj = {
                        'type': 'img',
                        'src': src
                    }
                }
                if (this.config.addClass) {
                    obj.class = currentNode.classList.toString();
                }

                if (obj.alt || obj.src) {
                    this.parsed.push(obj);
                    if (this.config.highlightContent) {
                        currentNode.style.border = "1px solid rgb(255, 0, 0)";
                    }
                }
            }

            if (!this.config.fulltext && currentNode.nodeType === 3 && !this.usedTextNodes.includes(currentNode)) {
                let parent = currentNode.parentElement;
                if (this.isVisible(parent)) {
                    let text = currentNode.data.trim();
                    if (text.length > 0) {
                        obj = {
                            'type': 'text',
                            'text': currentNode.data.trim()
                        };
                        if (this.config.addClass) {
                            obj.class = parent.classList.toString();
                        }
                        if (this.config.highlightContent) {
                          parent.style.border = "1px solid rgb(255, 0, 0)";
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
         * where o.children.length == 0 and with o.textContent
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

            while(treeWalker.nextNode()) {
                this.extractReadable(treeWalker.currentNode);
            }

            if (this.config.fulltext) {
                this.parsed.push({
                    fulltext: container.textContent.trim(),
                });
            }

            return this.parsed;
        }

    }

    let struktur = new Struktur(config);
    return JSON.stringify(struktur.struktur(), null, 2);
}
