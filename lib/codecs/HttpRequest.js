import is from "is";

const httpMethods       = [
	      "PRI",
	      "ACL",
	      "BASELINE-CONTROL",
	      "BIND",
	      "CHECKIN",
	      "CHECKOUT",
	      "CONNECT",
	      "COPY",
	      "DELETE",
	      "GET",
	      "HEAD",
	      "LABEL",
	      "LINK",
	      "LOCK",
	      "MERGE",
	      "MKACTIVITY",
	      "MKCALENDAR",
	      "MKCOL",
	      "MKREDIRECTREF",
	      "MKWORKSPACE",
	      "MOVE",
	      "OPTIONS",
	      "ORDERPATCH",
	      "PATCH",
	      "POST",
	      "PRI",
	      "PROPFIND",
	      "PROPPATCH",
	      "PUT",
	      "REBIND",
	      "REPORT",
	      "SEARCH",
	      "TRACE",
	      "UNBIND",
	      "UNCHECKOUT",
	      "UNLINK",
	      "UNLOCK",
	      "UPDATE",
	      "UPDATEREDIRECTREF",
	      "VERSION-CONTROL"
      ],
      httpRequestFormat = new RegExp(
	      "^(?<method>" + httpMethods.join("|") + ")\\s+(?<path>[^\\s]+)\\s+(?<version>http\\/[\\d\\.]+)\\n" +
	      "(?<headers>(([^\\:\\n]+\\:[^\\n]*)[\\n])*)" +
	      "[\\n]+" +
	      //"[\\n]" +
	      "(?<body>(.*\\s*)*)$",
	      "im"
      );

export const priority = 10;
export const weight   = 100;

export function stringify( data, options, stringifyAny ) {
	let obj = { __proto__: null }, newRawValue;
	
	if ( data.type === "HttpRequest" ) {
		let childs          = [...data.childs],
		    body            = data.withBody && childs.pop(),
		    headers         = childs.pop(),
		    head            = childs.pop(),
		    bodyContent     = body && stringify(body, options, stringifyAny),
		    headersFiltered = headers.childs.filter(obj => !/^content-length$/i.test(obj.key));
		if ( data.newValue )
			return data.newValue;
		obj = head.childs.map(
			obj => (stringify(obj, options, stringifyAny))
		).join(" ") + "\r\n";
		if ( headersFiltered.length )
			obj += headersFiltered.map(
				obj => (obj.key + ": " + stringifyAny(obj.childs[0], options))
			).join("\r\n") + "\r\n";
		if ( bodyContent )
			obj += "Content-Length: " + (bodyContent.length + 2) + "\r\n\r\n"
				+ bodyContent + "\r\n\r\n";
		else obj += "\r\n"
	}
	else if ( /^Http(Method|Path|Version)$/.test(data.type) ) {
		obj = data.childs.map(
			obj => (stringify(obj, options, stringifyAny))
		).join(" ")
	}
	else if ( data.type === "HttpRequestBody" ) {
		if ( data.newValue )
			return data.newValue + "\r\n";
		obj = stringifyAny(data.childs[0], options) + "\r\n"
	}
	else
		obj = stringifyAny(data, options);
	return obj;
}

export function parse( { data }, options, codecs, parseAny ) {
	let output = {
		type  : "HttpRequest",
		childs: []
	};
	try {
		let parsed;
		if ( is.string(data) ) {
			data = data.replace(/\r\n/ig, "\n");
			if ( httpRequestFormat.test(data) ) {
				parsed = data.match(httpRequestFormat);
				if ( !parsed ) {
					//console.log('parse::parse:105: ', data);
					return;
				}
				parsed      = parsed.groups;
				output.data = data;
			}
		}
		else {
			return false;
		}
		if ( !parsed )
			return;
		//console.log('parse::parse:117: ', parsed.headers.split(/[\n\r]/)
		//                                        .filter(line => !/^\s*$/.test(line)));
		output.childs.push(
			{
				type  : "HttpRequestHead",
				data  : data.split(/[\n]/)[0],
				childs: [
					{
						type      : "HttpMethod",
						__humanKey: "Method",
						//data: parsed.method,
						childs: [
							{ data: parsed.method }
						]
					},
					{
						type: "HttpPath",
						//data  : parsed.path,
						childs: [
							{ data: parsed.path }
						]
					},
					{
						type      : "HttpVersion",
						__humanKey: "HttpVersion",
						//data: parsed.version,
						childs: [
							{ data: parsed.version }
						]
					}
				]
			},
			{
				type      : "HttpHeaders",
				__humanKey: "Headers",
				data      : parsed.headers,
				childs    : parsed.headers.split(/[\n\r]/)
				                  .filter(line => !/^\s*$/.test(line))
				                  .map(line => {
					                       let mLine = line.split(":"),
					                           key   = mLine.shift().trim(),
					                           value = mLine.join(":").trim();
					                       return {
						                       type: "Prop",
						                       key,
						                       //data  : line,
						                       childs: [
							                       {
								                       baseType: /^cookie$/i.test(key) ? "KeyValue" : undefined,
								                       //__humanKey: /^cookie$/i.test(key) ? "Cookies" : undefined,
								                       data: value
							                       }
						                       ]
					                       }
				                       }
				                  )
			})
		if ( parsed.body.trim() ) {
			output.withBody = true;
			output.childs.push(
				{
					type      : "HttpRequestBody",
					__humanKey: "Body",
					data      : parsed.body,
					childs    : [
						{
							data: parsed.body.replace(/\n$/, "")
						}
					]
				}
			)
		}
		return output;
	} catch ( e ) {
		return false;
	}
	
}

