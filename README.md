# Struktur

An abstract algorithm that recognizes a recurring structure in rendered HTML pages without any manual rules. Outputs JSON.

**Struktur** is the end of web scraping / information extraction as we know it.

With **Struktur**, you never even have to open your Web Dev Console. You simply run 
**Struktur** on a page that you want to extract data from and **Struktur** automatically suggest possible structured information.

Struktur finds collections of items with similar structure. In the overwhelming majority of cases, this is the data you need to extract.

## Motivation

There are two reasons why web scraping is painful

#### 1. CSS Selectors and Xpath queries suck big time
 
Finding good CSS selectors and XPath queries to target information on web sites is a strenuous task. Often the same data is rendered in slightly different markup under different conditions. This means that we often need different versions of CSS selectors / Xpath for the same targeted information. The markup of websites changes frequently and the maintaining of those selectors is soul crushing.


![example for naughty HTML](examples/badhtml.png)

#### 2. Getting blocked based on IP address, headers, captchas, missing javascript capabilities

The other painful reality of web scraping is getting blocked by web sites. There is a complete industry with companies such as Distil and Incapsula that develop anti scraping software. In 2019, advanced scraping is almost always done with real browsers that are controlled with software such as puppeteer or nightmarejs.  The reasons for that is that we want to behave like real humans. Real humans do not browse websites with curl. Instead, real humans have javascript enabled and real humans use something that renders HTML/CSS/JS (that thing is called *browser*).

While we can solve the second problem only with more resources, we can solve the first problem algorithmically. The only condition is that we need to render the pages that we want to scrape, therefore we need to scrape using headless browsers.

We need an abstract algorithm that automatically detects relevant structure in rendered web pages.


## What is *relevant* structure?

Relevant structure is a collection of similar objects which are of interest. 

+ The Google Search Engine has 10 results objects that consist of a title, link and snippet.
+ The amazon product search results page has many products that are rendered in a grid system and each share a product image, price and title.
+ News sites present their headlines on a frontpage. Each headline consists of a title (with link to the story), description and potentially author name and publication date.

All those items have a common structure when interpretted visually: They have more or less 
the same vertical alignment, the same font size, the same html tags and so on.

The huge problem however is that this structure is created dynamically from the interplay of HTML, JavaScript and CSS. This means that the HTML structure does not necessarily need to resemble the visual output.


## What assumptions does Struktur make?

1. The input of **Struktur** is a website rendered by a modern browser with javascript support. We will use puppeteer to render websites. 
2. We assume that structure is what humans consider to be related structure. 
	+ Identical horizontal/vertical alignment among objects
	+ More or less same size of bounding rectangles of the object of interest
	+ As output we are merely interested in *Links*, *Text* and Images (which are Links). The output needs to be visible.
	+ Only structure that takes a major part of the visible viewport is considered structure
	+ There must be at least N=5 related elements

Those assumptions are important. 

When websites protect themselves against web scraping by randomizing class names, injecting dummy HTML content, creating duplicate elements, dynamically altering the contents of the site, they still need to present a website that can be visually interpreted by the non malicious visitor. **Struktur** makes use of this fact.

## What does Struktur output?

*Struktur* outputs JSON with the parsed structure from a URL that is was fed. 


## High level algorithm overview

Take a starting node as input. If no node is given, use the `body` element.

See if the element contains at least N identical elements (such as `div`, `article`, `li`, `section`, ...). If yes, mark those child nodes
as potential structure candidates.

Visit the next node in the tree and check again for N identical elements.

After all candidates have been found, get the bonding boxes of the candidates with `getBoundingClientRect()`

If the bounding boxes vertically and horizontally align and have more or less identical dimensions *and* make up 
a significant part of `document.body.getBoundingClientRect()`, add those elements to the potential structures.

In the next stage we compare the items within the potential structures. If they share *common characteristics*, we consider those elements to form a valid structure. We are only interested in `img`, `a` and textNodes. Furthermore, we are only interested in visible textNodes.


## Clustering

https://github.com/harthur/clustering

## Examples

1. [Struktur explores the Google SERP](examples/google.png)
2. [Struktur finds articles on NYT](examples/nyt.png)
3. [All amazon products are detected by Struktur](examples/amaonz.png)