<h1 align="center">magic-web-string-parser</h1>

___

<p align="center">
<a href="https://www.npmjs.com/package/magic-web-string-parser">
<img src="https://img.shields.io/npm/v/magic-web-string-parser.svg" alt="Npm version" /></a>
<img src="https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat" /></p>

___


A lib to recursively map any property encoded in a String, change theirs values, and re-encode keeping the original encoding structure.

While this is working, that's an hacky not tested hack/pentest tool lib with probable various false positive matchs

For now can deal with : Paths, Base64, Json, Query String, MultiLines blob, Http Request, Url & coma Key value list


## You... like it / it saved your day / you stole all the code / you want more?

[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](#)

BTC     : bc1qh43j8jh6dr8v3f675jwqq3nqymtsj8pyq0kh5a<br/>
Paypal  : <span class="badge-paypal"><a href="https://www.paypal.com/donate/?hosted_button_id=ECHYGKY3GR7CN" title="Donate to this project using Paypal"><img src="https://img.shields.io/badge/paypal-donate-yellow.svg" alt="PayPal donate button" /></a></span>


### JS Api :
```
const mwsp = require("magic-web-string-parser");

let parsed = mwsp.parse("...");

parsed.set(
  jsonPathSelector, // Ex: $..Prop.*.value[?(@.isLeaf)]
  newValue,         // value to set
  enumerate,        // do return an array with 1 stringified versions per replaced value ( will not set the given values on the current instance )
  raw               // do set as raw Json  
) // return one of :
  //   - array of 1 serialized version per replaced value 
  //   - the serialized strings with provided value in all selected node

parsed.get(
  jsonPathSelector // Ex: $..Prop.*.value[?(@.isLeaf)]
) // return jsonPath selection

parsed.stringify() // return as string with updated values
```
### CLI Api :
```
$ npm i -g magic-web-string-parser

$ mws-decode -h
Help :
        (StdIn)         : Input string ( Ex : mws-decode <<< "someStringToParse" )
        -i, --input     : Input string
        --raw           : Output query-able parsed tree
        --vars          : Output all props found with theirs raw values
        --stats         : Output all found types with theirs occurrences count
        -p, --path      : Output with Json Paths
        -s, --select    : Select matching nodes, set new value if provided, print results
                Ex :
                        Set & select a value in all Json / Qs leaf props ( having a primitive value like Number, String,... ) :
                                -s="$..Prop.*.value[?(@.isLeaf)] << payload"
                        Set & select a value in all Json / Qs leaf props with a key matching /url/ig :
                                -s="$..Prop[?(/url/ig.test(@.key))].value[?(@.isLeaf)] << payload"
                        Select all Paths found in a child prop of a Qs section :
                                -s="$..Qs..Path"

$ mws-recode -h
Help :
        (StdIn)         : Input string ( Ex : mws-recode <<< "someStringToParse" )
        -i, --input     : Input string
        -e, --enumerate : stringify input once per replaced value
        --json          : output in Json
        -s, --set       : Set a new value in selected items
                Ex :
                        Set a value in all Json / Qs leaf props ( having a primitive value like Number, String,... ) :
                                -s="$..Prop.*.value[?(@.isLeaf)] << payload"
                        Set a value in all Json / Qs leaf props with a key matching /url/ig :
                                -s="$..Prop[?(/url/ig.test(@.key))].value[?(@.isLeaf)] << payload"
                        Set a raw value in all Qs root props :
                                -s="$..QsObject.*.Prop.*.value <<< {\"__proto__\":{\"toString\":\"toKill\"}}"
                        Replace all Paths found in a child prop of a Qs section :
                                -s="$..Qs..Path << /path/traversal/1337"

```

### CLI recode examples :
```
$ npm i -g magic-web-string-parser

$ mws-recode   -s="$..Prop[?(/^test/ig.test(@.key))].value << /1337" <<<  "/zolizoli/%7B%22test%22:%7B%22retest%22:%22value%22%7D%7D/path?test=eyJ5byI6Inlv4p2k77iPIn0KeyJ5byI6Im5leHTinaTvuI8ifQ%3D%3D&yuup=%7B%22test%22:%7B%22retest%22:true%7D%7D"                                         
/zolizoli/%7B%22test%22%3A%22%2F1337%22%7D/path?test=%2F1337&yuup=%7B%22test%22%3A%22%2F1337%22%7D
                              
$ mws-recode   -s="$..Prop[?(/^re/ig.test(@.key))].value[?(@.isLeaf)] << /1337" <<<  "/zolizoli/%7B%22test%22:%7B%22retest%22:%22value%22%7D%7D/path?test=eyJ5byI6Inlv4p2k77iPIn0KeyJ5byI6Im5leHTinaTvuI8ifQ%3D%3D&yuup=%7B%22test%22:%7B%22retest%22:true%7D%7D"                              
/zolizoli/%7B%22test%22%3A%7B%22retest%22%3A%22%2F1337%22%7D%7D/path?test=eyJ5byI6Inlv4p2k77iPIn0NeyJ5byI6Im5leHTinaTvuI8ifQ%3D%3D&yuup=%7B%22test%22%3A%7B%22retest%22%3A%22%2F1337%22%7D%7D

$ mws-recode   -s="$..Prop[?(/yo/ig.test(@.key))].value << /1337" <<<  "/zolizoli/%7B%22test%22:%7B%22retest%22:%22value%22%7D%7D/path?test=eyJ5byI6Inlv4p2k77iPIn0KeyJ5byI6Im5leHTinaTvuI8ifQ%3D%3D&yuup=%7B%22test%22:%7B%22retest%22:true%7D%7D"                              
/zolizoli/%7B%22test%22%3A%7B%22retest%22%3A%22value%22%7D%7D/path?test=eyJ5byI6Ii8xMzM3In0NeyJ5byI6Ii8xMzM3In0%3D&yuup=%7B%22test%22%3A%7B%22retest%22%3Atrue%7D%7D

$ mws-recode   -s="$..Prop[?(/^re/ig.test(@.key))].value[?(@.isLeaf)] <<< {\"obj\":1337}" <<<  "/zolizoli/%7B%22test%22:%7B%22retest%22:%22value%22%7D%7D/path?test=eyJ5byI6Inlv4p2k77iPIn0KeyJ5byI6Im5leHTinaTvuI8ifQ%3D%3D&yuup=%7B%22test%22:%7B%22retest%22:true%7D%7D"                                
/zolizoli/%7B%22test%22%3A%7B%22retest%22%3A%7B%22obj%22%3A1337%7D%7D%7D/path?test=eyJ5byI6Inlv4p2k77iPIn0NeyJ5byI6Im5leHTinaTvuI8ifQ%3D%3D&yuup=%7B%22test%22%3A%7B%22retest%22%3A%7B%22obj%22%3A1337%7D%7D%7D

& mws-recode  -e -s="$..Prop[?(/^test/ig.test(@.key))].value << /1337" <<<  "/zolizoli/%7B%22test%22:%7B%22retest%22:%22value%22%7D%7D/path?test=eyJ5byI6Inlv4p2k77iPIn0KeyJ5byI6Im5leHTinaTvuI8ifQ%3D%3D&yuup=%7B%22test%22:%7B%22retest%22:true%7D%7D"                                                   
/zolizoli/%7B%22test%22%3A%22%2F1337%22%7D/path?test=eyJ5byI6Inlv4p2k77iPIn0NeyJ5byI6Im5leHTinaTvuI8ifQ%3D%3D&yuup=%7B%22test%22%3A%7B%22retest%22%3Atrue%7D%7D       
                                                                                                                                                                      
/zolizoli/%7B%22test%22%3A%7B%22retest%22%3A%22value%22%7D%7D/path?test=%2F1337&yuup=%7B%22test%22%3A%7B%22retest%22%3Atrue%7D%7D                                     
                                                                                                                                                                      
/zolizoli/%7B%22test%22%3A%7B%22retest%22%3A%22value%22%7D%7D/path?test=eyJ5byI6Inlv4p2k77iPIn0NeyJ5byI6Im5leHTinaTvuI8ifQ%3D%3D&yuup=%7B%22test%22%3A%22%2F1337%22%7D

& mws-recode --json -e -s="$..Prop[?(/^test/ig.test(@.key))].value << /1337" <<<  "/zolizoli/%7B%22test%22:%7B%22retest%22:%22value%22%7D%7D/path?test=eyJ5byI6Inlv4p2k77iPIn0KeyJ5byI6Im5leHTinaTvuI8ifQ%3D%3D&yuup=%7B%22test%22:%7B%22retest%22:true%7D%7D"
["/zolizoli/%7B%22test%22%3A%22%2F1337%22%7D/path?test=eyJ5byI6Inlv4p2k77iPIn0NeyJ5byI6Im5leHTinaTvuI8ifQ%3D%3D&yuup=%7B%22test%22%3A%7B%22retest%22%3Atrue%7D%7D","/zolizoli/%7B%22test%22%3A%7B%22retest%22%3A%22value%22%7D%7D/path?test=%2F1337&yuup=%7B%22test%22%3A%7B%22retest%22%3Atrue%7D%7D","/zoli
zoli/%7B%22test%22%3A%7B%22retest%22%3A%22value%22%7D%7D/path?test=eyJ5byI6Inlv4p2k77iPIn0NeyJ5byI6Im5leHTinaTvuI8ifQ%3D%3D&yuup=%7B%22test%22%3A%22%2F1337%22%7D"]

```
### CLI decode examples :
```
$ mws-decode  <<<  "/zolizoli/%7B%22test%22:%7B%22retest%22:%22value%22%7D%7D/path?test=eyJ5byI6Inlv4p2k77iPIn0KeyJ5byI6Im5leHTinaTvuI8ifQ%3D%3D&yuup=%7B%22test%22:%7B%22retest%22:true%7D%7D" 
  UrlPath[0]
   - "/zolizoli/%7B%22test%22:%7B%22retest%22:%22value%22%7D%7D/path?test=eyJ5byI6Inlv4p2k77iPIn0KeyJ5byI6Im5leHTinaTvuI8ifQ%3D%3D&yuup=%7B%22test%22:%7B%22retest%22:true%7D%7D"
   Path[0]
    - "/zolizoli/%7B%22test%22:%7B%22retest%22:%22value%22%7D%7D/path"
    PathItem[0]
     - "zolizoli"
     String[0]
      - "zolizoli"
    PathItem[1]
     - "%7B%22test%22:%7B%22retest%22:%22value%22%7D%7D"
     Json[0]
      - "{\"test\":{\"retest\":\"value\"}}"
      JsonObject[0]
       - "{\"test\":{\"retest\":\"value\"}}"
       Prop[0] test =
         - "{\"retest\":\"value\"}"
         Prop[0] retest =
           - "value"
    PathItem[2]
     - "path"
     String[0]
      - "path"
   PathQuery[0]
    - "test=eyJ5byI6Inlv4p2k77iPIn0KeyJ5byI6Im5leHTinaTvuI8ifQ%3D%3D&yuup=%7B%22test%22:%7B%22retest%22:true%7D%7D"
    Qs[0]
     - "test=eyJ5byI6Inlv4p2k77iPIn0KeyJ5byI6Im5leHTinaTvuI8ifQ%3D%3D&yuup=%7B%22test%22:%7B%22retest%22:true%7D%7D"
     QsObject[0]
      - "{\"test\":\"eyJ5byI6Inlv4p2k77iPIn0KeyJ5byI6Im5leHTinaTvuI8ifQ==\",\"yuup\":\"{\\\"test\\\":{\\\"retest\\\":true}}\"}"
      Prop[0] test =
        - "eyJ5byI6Inlv4p2k77iPIn0KeyJ5byI6Im5leHTinaTvuI8ifQ=="
        MultiLines[0]
         - "{\"yo\":\"yo❤️\"}\n{\"yo\":\"next❤️\"}"
         Line[0]
          Json[0]
           - "{\"yo\":\"yo❤️\"}"
           JsonObject[0]
            - "{\"yo\":\"yo❤️\"}"
            Prop[0] yo =
              - "yo❤️"
         Line[1]
          Json[0]
           - "{\"yo\":\"next❤️\"}"
           JsonObject[0]
            - "{\"yo\":\"next❤️\"}"
            Prop[0] yo =
              - "next❤️"
      Prop[1] yuup =
        - "{\"test\":{\"retest\":true}}"
        QsObject[0]
         - "{\"test\":{\"retest\":true}}"
         Prop[0] test =
           - "{\"retest\":true}"
           Prop[0] retest =
             - true

```

```
$ mws-decode --stats <<<  "/zolizoli/%7B%22test%22:%7B%22retest%22:%22value%22%7D%7D/path?test=eyJ5byI6Inlv4p2k77iPIn0KeyJ5byI6Im5leHTinaTvuI8ifQ%3D%3D&yuup=%7B%22test%22:%7B%22retest%22:true%7D%7D"

UrlPath       : 1 items
Path          : 1 items
PathItem      : 3 items
String        : 5 items
Json          : 3 items
JsonObject    : 4 items
Prop          : 8 items
PathQuery     : 1 items
Qs            : 2 items
QsObject      : 3 items
Base64        : 1 items
MultiLines    : 1 items
Line          : 2 items
Boolean       : 1 items

```

```
$ mws-decode --vars <<<  "/zolizoli/%7B%22test%22:%7B%22retest%22:%22value%22%7D%7D/path?test=eyJ5byI6Inlv4p2k77iPIn0KeyJ5byI6Im5leHTinaTvuI8ifQ%3D%3D&yuup=%7B%22test%22:%7B%22retest%22:true%7D%7D"

test          = "{\"retest\":\"value\"}"
retest        = "value"
test          = "eyJ5byI6Inlv4p2k77iPIn0KeyJ5byI6Im5leHTinaTvuI8ifQ=="
yo            = "yo❤️"
yo            = "next❤️"
yuup          = "{\"test\":{\"retest\":true}}"
test          = "{\"retest\":true}"
retest        = true

```

