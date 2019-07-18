## TODO list for struktur

### Known issues

1. Struktur is way too slow and inefficient. Reasons: we traverse a couple of times the whole DOM. [done: using createTreeWalker() now]

### 13.7.2018


2. Make struktur runnable in puppeteer example, inject script via evaluate and make screenshot after highlighting the struktur in blue, highlight elements within objects in other blue color **[done]**

3. Find a algorithm that parses text nodes visually into a coherent global node. **[done: Not necessary because it is impossible to know what text belongs across different elements. We can only make educated guesses]**.


### 14.7.2018

1. Write blog article about struktur on incolumitas.com, take most stuff from readme here

2. Create a filter that rejects objects in structures that do not match with the majority of other objects. This is a clustering problem and not trivial.

3. Show some examples for struktur


### 18.7.2018

1. Add a suitable license [added MIT]

2. Add option to parse all text in a structure object

3. clean up code [done]

4. Use always textContent, except when parsing links with text, the user innerText [done]

5. Remove structures without at least one linkText
    - add type to linkText [done]
    - implement proper filterObject and filterStructure methods [done]
    
    
6. Update examples