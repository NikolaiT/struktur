## TODO list for struktur

### Known issues

1. Struktur is way too slow and inefficient. Reasons: we traverse a couple of times the whole DOM.

### 13.7.2018

1. Write blog article about struktur on incolumitas.com, take most stuff from here

2. Make struktur runnable in puppeteer example, inject script via evaluate and make screenshot after highlighting the struktur in blue, highlight elements within objects in other blue color **[done]**

3. Find a algorithm that parses text nodes visually into a coherent global node. **[done: Not necessary because it is impossible to know what text belongs across different elements. We can only make educated guesses]**.

4. Create a filter that rejects objects in structures that do not match with the majority of other objects. This is a clustering problem and not trivial.