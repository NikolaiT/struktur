# Struktur

An abstract algorithm that recognizes a recurring structure in rendered HTML pages.

**Struktur** is the end of web scraping as we know it. I used to spend hours upon hours
searching smart CSS selectors and XPath queries in order to target the information I 
wanted to scrape from web pages.

With **Struktur**, you never even have to open your Web Dev Console. You simply run 
**Struktur** on a page that you want to extract data from and **Struktur** automatically
suggest possible structured information. You select the structure you are interested in 
give the data variable names. 

You only need to create the logic that enters your search terms into input fields. The 
parsing scraping of data is handled completely by **Struktur**.


## Motivation

The main motivation is that defining CSS / Xpath selectors for web scraping projects is a 
strenous task. The markup of websites changes frequently and the maintaining of those selectors
is soul crushing.

Therefore, we need a abstract algorithm that automatically detects relevant structure in 
html pages. 


## What is *relevant* structure?

Relevant structure is a collection (list) of objects which are of interest. 

Example 1: The Google SERP page has 10 items that consist of a title, link and snippet.
Example 2: The amazon product search results page list has many products that are rendered in a grid system.

All those items have a common structure when interpretted visually: They have more or less 
the same vertical alignment, the same font size, the same html tags and so on.

The huge problem however is that this structure is created dynamically from the interplay of 
HTML, JavaScript and CSS. This means that the HTML structure does not necessarily need to ressemble
the visual output.


## What assumptions does Struktur make?

1. The input of *Struktur* is a website rendered by a modern browser. We will use puppeteer to render 
	websites.
2. We assume that structure is what humans consider to be related structure. 
	+ Identical horizontal/vertical alignment
	+ More or less same size of bounding rectangles of the object of interest
	+ As output we are merily interested in *Links*, *Text* and Images (which are Links) 
	+ Only structure that takes a major part of the viewport is considered structure
	+ There must be at least N=5 related elements

Those assumptions are important. 

When websites protect themselves against scraping by randomizing class names, injecting dummy HTML 
content, creating duplicate elements, dynamically altering the contents of the site, they still need
to create a website that can easily interpreted by the non malicious visitor. We abuse this fact.

## What does Struktur output?

*Struktur* outputs JSON with the parsed structure from a URL that is was fed. 


## Algorithm

Take a starting node as input. If no node is given, use the `body` element.

See if the element contains at least N identical elements (such as `div`, `article`, `li`, `section`, ...). If yes, mark those child nodes
as potential structure candidates.

Visit the next node in the tree and check again for N identical elements.

After all candidates have been found, get the bonding boxes of the candidates with `getBoundingClientRect()`

If the bounding boxes vertically and horizontically align and have more or less identical dimensions *and* make up 
a significant part of `document.body.getBoundingClientRect()`, add those elements to the potential structures.

In the next stage we compare the items within the potential strcutures. If they share *common caracteristics*, we consider
those elements to form a valid structure.


### Check for identical elements

```js

(function findCandidates() {

	const N = 5;
	const minWidth = 200;
	const minHeight = 200;

	const structure_tags = ['div', 'article', 'p', 'section', 'span'];

	var allElems = document.body.getElementsByTagName('*');

	var candidates = [];
	var found = [];

	for (element of allElems) {
		if (element.childElementCount > N) {
			let child_tags = {};
			for (var i = 0; i < element.childElementCount; i++) {
				let tag = element.children[i].tagName.toLowerCase();
				if (structure_tags.includes(tag)) {
					child_tags[tag] = child_tags[tag] ? child_tags[tag] + 1 : 1;
				}
			}

			for (tag in child_tags) {
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
	// horizontically or vertically
	for (candidate of candidates) {

		var children = Array.from(candidate.node.children);
		children = children.filter((child) => {
			return child.tagName.toLowerCase() === candidate.tag;
		});

		var heights = [];
		var widths = [];

		for (child of children) {
			var rect = child.getBoundingClientRect();
			if (rect.width > minWidth) {
				widths.push(rect.width);
			}
			if (rect.height > minHeight) {
				heights.push(rect.height);
			}
		}

		if (heights.length > 0 && heights.every( e => e === heights[0] )) {
			found.push(children);
		}

		if (widths.length > 0 && widths.every( e => e === widths[0] )) {
			found.push(children);
		}
	}

	return found;
})();
```