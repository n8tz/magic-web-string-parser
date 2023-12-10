import qs from "qs";


export function stringify( data, options, stringifyAny ) {
	let obj, nodes = data.childs, params;
	if ( data.type === "Csrf" ) {
		obj = nodes.map(node => stringifyAny(node, options)).join("\r" + (data.csrf ? "\n" : ""))
	}
	return obj;
}

export function parse( { data }, options, codecs ) {
	let output = {
		    type  : "Csrf",
		    childs: []
	    },
	    lines;
	if ( !data )
		return;
	output.csrf = data.includes("\r\n");
	try {
		
		let parsed = data.split(/\r?\n/);
		if ( parsed.length <= 1 ) {
			return;
		}
		output.childs.push(
			...parsed.map(
				item => ({
						data: item
					}
				)
			)
		)
	} catch ( e ) {
		
		return false;
	}
	return output;
}
