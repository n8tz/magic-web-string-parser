# magic-web-string-parser

A lib to recursively map any property encoded in a string, change theirs values, and re-encode keeping the original encoding structure.

While this is working, but that's a hacky hack/pentest tool lib, some doc may come.. or probably not :)

That's said, it's working and usefull ( at least for me ;) )

Here some infos :
```
const mwsp = require("magic-web-string-parser")

let parsed = mwsp.parse("/zolizoli/%7B%22test%22:%7B%22retest%22:%22value%22%7D%7D/path?test=eyJ5byI6Inlv4p2k77iPIn0KeyJ5byI6Im5leHTinaTvuI8ifQ%3D%3D&yuup=%7B%22test%22:%7B%22retest%22:%22value%22%7D%7D")
`parsed ~==
{
  "root": {}, // the  root node of the structure 
  "propsByPath": {/*...*/}, 
  "leafsByPath": {/*...*/},
  "valuesByPath": { // ex :
    "#root.UrlPath[0]": "zolizoli",
    "#root.UrlPath[2]": "path",
    "#root.UrlPath[1].Json[0].jsonObject[0].prop[0].jsonObject[0].prop[0]": "value",
    "#root.UrlPath[3].UrlEncoded[0].Json[0].jsonObject[0].prop[0].Base64[1].Csrf[0].Json[0].jsonObject[0].prop[0]": "yo❤️",
    "#root.UrlPath[3].UrlEncoded[0].Json[0].jsonObject[0].prop[0].Base64[1].Csrf[1].Json[0].jsonObject[0].prop[0]": "next❤️",
    "#root.UrlPath[3].UrlEncoded[0].Json[0].jsonObject[1].prop[0].Json[0].jsonObject[0].prop[0].jsonObject[0].prop[0]": "value"
  },
  "stringNodesByKey": {// all string value of prop by the keys seen
    "test": [/*...*/],
    "yo": [/*...*/]
  },
  "nodesByKey": {// all nodes that are value of a key seen
    "test": [/*...*/],
    "yuup": [/*...*/],
    "retest": [/*...*/],
    "yo": [/*...*/]
  },
  "nodesByType": {
    "UrlPath": [/*...*/],
    "string": [/*...*/],
    "Json": [],
    "UrlEncoded": [],
    "jsonObject": [],
    "prop": [],
    "Base64": [],
    "Csrf": []
  }
}
`
parsed.stringNodesByKey.retest[0].newValue="a new value"

mwsp.stringify(parsed)
// rebuild the string keeping the same multiples encodings
```
