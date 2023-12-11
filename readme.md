# magic-web-string-parser

A lib to recursively map any property encoded in a string, change theirs values, and re-encode keeping the original encoding structure.

While this is working, but that's a hacky hack/pentest tool lib, some doc may come.. or probably not :)

That's said, it's working and usefull ( at least for me ;) )

For now can deal with : Paths, Base64, Json, query string


Here some infos :

```
$ npm i -g magic-web-string-parser

$ mws-recode   -s="$..prop[?(/^test/ig.test(@.key))].value << /1337" <<<  "/zolizoli/%7B%22test%22:%7B%22retest%22:%22value%22%7D%7D/path?test=eyJ5byI6Inlv4p2k77iPIn0KeyJ5byI6Im5leHTinaTvuI8ifQ%3D%3D&yuup=%7B%22test%22:%7B%22retest%22:true%7D%7D"                                         
/zolizoli/%7B%22test%22%3A%22%2F1337%22%7D/path?test=%2F1337&yuup=%7B%22test%22%3A%22%2F1337%22%7D
                              
$ mws-recode   -s="$..prop[?(/^re/ig.test(@.key))].value[?(@.native)] << /1337" <<<  "/zolizoli/%7B%22test%22:%7B%22retest%22:%22value%22%7D%7D/path?test=eyJ5byI6Inlv4p2k77iPIn0KeyJ5byI6Im5leHTinaTvuI8ifQ%3D%3D&yuup=%7B%22test%22:%7B%22retest%22:true%7D%7D"                              
/zolizoli/%7B%22test%22%3A%7B%22retest%22%3A%22%2F1337%22%7D%7D/path?test=eyJ5byI6Inlv4p2k77iPIn0NeyJ5byI6Im5leHTinaTvuI8ifQ%3D%3D&yuup=%7B%22test%22%3A%7B%22retest%22%3A%22%2F1337%22%7D%7D

$ mws-recode   -s="$..prop[?(/yo/ig.test(@.key))].value << /1337" <<<  "/zolizoli/%7B%22test%22:%7B%22retest%22:%22value%22%7D%7D/path?test=eyJ5byI6Inlv4p2k77iPIn0KeyJ5byI6Im5leHTinaTvuI8ifQ%3D%3D&yuup=%7B%22test%22:%7B%22retest%22:true%7D%7D"                              
/zolizoli/%7B%22test%22%3A%7B%22retest%22%3A%22value%22%7D%7D/path?test=eyJ5byI6Ii8xMzM3In0NeyJ5byI6Ii8xMzM3In0%3D&yuup=%7B%22test%22%3A%7B%22retest%22%3Atrue%7D%7D

$ mws-recode   -s="$..prop[?(/^re/ig.test(@.key))].value[?(@.native)] <<< {\"obj\":1337}" <<<  "/zolizoli/%7B%22test%22:%7B%22retest%22:%22value%22%7D%7D/path?test=eyJ5byI6Inlv4p2k77iPIn0KeyJ5byI6Im5leHTinaTvuI8ifQ%3D%3D&yuup=%7B%22test%22:%7B%22retest%22:true%7D%7D"                                
/zolizoli/%7B%22test%22%3A%7B%22retest%22%3A%7B%22obj%22%3A1337%7D%7D%7D/path?test=eyJ5byI6Inlv4p2k77iPIn0NeyJ5byI6Im5leHTinaTvuI8ifQ%3D%3D&yuup=%7B%22test%22%3A%7B%22retest%22%3A%7B%22obj%22%3A1337%7D%7D%7D

```

```
$ mws-decode  <<<  "/zolizoli/%7B%22test%22:%7B%22retest%22:%22value%22%7D%7D/path?test=eyJ5byI6Inlv4p2k77iPIn0KeyJ5byI6Im5leHTinaTvuI8ifQ%3D%3D&yuup=%7B%22test%22:%7B%22retest%22:true%7D%7D" 
  UrlPath[0]
   - "/zolizoli/%7B%22test%22:%7B%22retest%22:%22value%22%7D%7D/path?test=eyJ5byI6Inlv4p2k77iPIn0KeyJ5byI6Im5leHTinaTvuI8ifQ%3D%3D&yuup=%7B%22test%22:%7B%22retest%22:true%7D%7D"
   Path[0]
    - "/zolizoli/%7B%22test%22:%7B%22retest%22:%22value%22%7D%7D/path"
    PathItem[0]
     - "zolizoli"
     string[0]
      - "zolizoli"
    PathItem[1]
     - "%7B%22test%22:%7B%22retest%22:%22value%22%7D%7D"
     Json[0]
      - "{\"test\":{\"retest\":\"value\"}}"
      jsonObject[0]
       - "{\"test\":{\"retest\":\"value\"}}"
       prop[0] test =
         - "{\"retest\":\"value\"}"
         prop[0] retest =
           - "value"
    PathItem[2]
     - "path"
     string[0]
      - "path"
   Qs[0]
    - "test=eyJ5byI6Inlv4p2k77iPIn0KeyJ5byI6Im5leHTinaTvuI8ifQ%3D%3D&yuup=%7B%22test%22:%7B%22retest%22:true%7D%7D"
    Json[0]
     jsonObject[0]
      - "{\"test\":\"eyJ5byI6Inlv4p2k77iPIn0KeyJ5byI6Im5leHTinaTvuI8ifQ==\",\"yuup\":\"{\\\"test\\\":{\\\"retest\\\":true}}\"}"
      prop[0] test =
        - "eyJ5byI6Inlv4p2k77iPIn0KeyJ5byI6Im5leHTinaTvuI8ifQ=="
        MultiLines[0]
         - "{\"yo\":\"yo❤️\"}\n{\"yo\":\"next❤️\"}"
         Line[0]
          Json[0]
           - "{\"yo\":\"yo❤️\"}"
           jsonObject[0]
            - "{\"yo\":\"yo❤️\"}"
            prop[0] yo =
              - "yo❤️"
         Line[1]
          Json[0]
           - "{\"yo\":\"next❤️\"}"
           jsonObject[0]
            - "{\"yo\":\"next❤️\"}"
            prop[0] yo =
              - "next❤️"
      prop[1] yuup =
        jsonObject[0]
         - "{\"test\":{\"retest\":true}}"
         prop[0] test =
           - "{\"retest\":true}"
           prop[0] retest =
             - true
```

```
$ mws-decode --stats <<<  "/zolizoli/%7B%22test%22:%7B%22retest%22:%22value%22%7D%7D/path?test=eyJ5byI6Inlv4p2k77iPIn0KeyJ5byI6Im5leHTinaTvuI8ifQ%3D%3D&yuup=%7B%22test%22:%7B%22retest%22:true%7D%7D"
UrlPath : 1 items
Path : 1 items
PathItem : 3 items
string : 5 items
Json : 5 items
jsonObject : 7 items
prop : 8 items
Qs : 1 items
Base64 : 1 items
MultiLines : 1 items
Line : 2 items
boolean : 1 items

```

```
mws-decode --vars <<<  "/zolizoli/%7B%22test%22:%7B%22retest%22:%22value%22%7D%7D/path?test=eyJ5byI6Inlv4p2k77iPIn0KeyJ5byI6Im5leHTinaTvuI8ifQ%3D%3D&yuup=%7B%22test%22:%7B%22retest%22:true%7D%7D"                                                                                                      
test="{\"retest\":\"value\"}"
retest="value"
test="eyJ5byI6Inlv4p2k77iPIn0KeyJ5byI6Im5leHTinaTvuI8ifQ=="
yo="yo❤️"
yo="next❤️"
yuup=undefined
test="{\"retest\":true}"
retest=true

```

