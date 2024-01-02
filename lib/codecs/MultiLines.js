import qs from "qs";
import is from "is";

export const priority = 0;

export function stringify( data, options, stringifyAny ) {
	let obj, nodes = data.childs, params;
	if ( data.type === "MultiLines" ) {
		obj = data.newValue || nodes.map(node => stringify(node, options, stringifyAny)).join(data.csrf ? "\r\n" : "\n")
	}
	else if ( data.type === "Line" ) {
		obj = data.newValue || nodes.map(node => stringifyAny(node, options)).join("")
	}
	return obj;
}

export function parse( { data }, options, codecs, parseAny ) {
	let output = {
		type  : "MultiLines",
		childs: []
	};
	
	if ( !is.string(data) )
		return;
	
	output.csrf = data.includes("\r\n");
	try {
		
		let parsed = data.replace(/\r\n/ig, "\n").split(/[\n]/);
		if ( parsed.length <= 1 ) {
			return;
		}
		output.childs.push(
			...parsed.map(
				item => ({
						type  : "Line",
						childs: [
							{
								data: item
							}
						]
					}
				)
			)
		)
	} catch ( e ) {
		
		return false;
	}
	return output;
}
