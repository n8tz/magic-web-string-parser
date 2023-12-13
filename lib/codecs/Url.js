import is from "is";
import qs from "qs";

const urlParts = [
	"host",
	"username",
	"password",
	"port",
	"protocol"
]

export const priority = 12;

export function stringify( data, options, stringifyAny ) {
	if ( data.type === "Url" ) {
		let obj = new URL("http://dummy.com");
		urlParts.forEach(
			( part, i ) => (
				obj[part] = stringifyAny(data.childs[i].childs[0], options)
			)
		);
		obj = obj + "";
		return obj.substring(0, obj.length - 1) + stringifyAny(data.childs[urlParts.length], options);
	}
	return "";
}

export function parse( { data }, options, codecs ) {
	let output = {
		type  : "Url",
		childs: []
	};
	if ( !is.string(data) || /[\n\r]/ig.test(data) )
		return false;
	try {
		let parsed = new URL(data);
		if ( !parsed.host )
			return;
		
		output.childs.push(
			...urlParts.map(
				part => ({
					type  : "Url" + part[0].toUpperCase() + part.substring(1),
					childs: [
						{ data: parsed[part] }
					]
				})
			),
			{
				data: parsed.pathname + (parsed.search || "") + (parsed.hash || "")
			}
		);
		return output;
	} catch ( e ) {
		return false;
	}
	
}
