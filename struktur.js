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