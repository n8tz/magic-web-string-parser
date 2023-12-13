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
	      "^(?<method>" + httpMethods.join("|") + ")\\s+(?<path>[^\\s]+)\\s+(?<version>http\\/[\\d\\.]+)[\\n]" +
	      "(?<headers>(([^\\:\\n]+\\:[^\\n]+)[\\n])+)" +
	      "[\\n]" +
	      "[\\n]" +
	      "(?<body>(.*\\s*)*)$",
	      "im"
      );

export const priority = 10;

export function stringify( data, options, stringifyAny ) {
	let obj = { __proto__: null }, newRawValue;
	
	if ( data.type === "HttpRequest" ) {
		obj = data.newValue ||
			data.childs.map(
				obj => (stringify(obj, options, stringifyAny))
			).join("\n")
	}
	else if ( /^Http(Method|Path|Version)$/.test(data.type) ) {
		obj = data.childs.map(
			obj => (stringify(obj, options, stringifyAny))
		).join(" ")
	}
	else if ( data.type === "HttpRequestHead" ) {
		obj = data.childs.map(
			obj => (stringify(obj, options, stringifyAny))
		).join(" ")
	}
	else if ( data.type === "HttpHeaders" ) {
		obj = data.childs.map(
			obj => (obj.key + ": " + stringifyAny(obj.childs[0], options))
		).join("\n")
	}
	else if ( data.type === "HttpRequestBody" ) {
		obj = "\n\n" + stringifyAny(data.childs[0], options)
	}
	else
		obj = stringifyAny(data, options);
	return obj;
}

export function parse( { data }, options, codecs ) {
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
				if ( !parsed )
					return;
				parsed      = parsed.groups;
				output.data = data;
			}
		}
		else {
			return false;
		}
		if ( !parsed )
			return;
		output.childs.push(
			{
				type  : "HttpRequestHead",
				data  : data.split(/[\n]/)[0],
				childs: [
					{
						type: "HttpMethod",
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
						type: "HttpVersion",
						//data: parsed.version,
						childs: [
							{ data: parsed.version }
						]
					}
				]
			},
			{
				type  : "HttpHeaders",
				data  : parsed.headers,
				childs: parsed.headers.split(/[\n\r]/)
				              .filter(line => !/^\s*$/.test(line))
				              .map(line => {
					                   let mLine = line.split(":"),
					                       key   = mLine.shift().trim(),
					                       value = mLine.join(":").trim()
					                   return {
						                   type: "Prop",
						                   key,
						                   //data  : line,
						                   childs: [
							                   {
								                   data: value
							                   }
						                   ]
					                   }
				                   }
				              )
			},
			{
				type  : "HttpRequestBody",
				data  : parsed.body,
				childs: [
					{
						data: parsed.body
					}
				]
			}
		)
		return output;
	} catch ( e ) {
		return false;
	}
	
}

