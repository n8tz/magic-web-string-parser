import is from "is";
import qs from "qs";

export const priority = 10;

export function stringify( data, options, stringifyAny ) {
	let obj, nodes = data.childs, params;
	if ( data.type === "UrlPath" ) {
		if ( data.withQueryParam ) {
			params = nodes[1];
		}
		obj = stringify(nodes[0], options, stringifyAny)
			+ (params ? "?" + stringifyAny(params, options) : "")
	}
	else if ( data.type === "Path" ) {
		if ( data.newValue )
			obj = data.newValue;
		else
			obj = "/" + nodes.map(node => stringify(node, options, stringifyAny)).join("/")
	}
	else if ( data.type === "PathItem" ) {
		if ( data.newRawValue )
			obj = data.newRawValue;
		else
			obj = qs.stringify({ value: data.newValue || stringifyAny(nodes[0], options) }).split("value=")[1]
	}
	return obj;
}

export function parse( { data }, options, codecs ) {
	let output = {
		    type  : "UrlPath",
		    childs: []
	    },
	    pathParams;
	if ( !is.string(data) || !data || data[0] !== "/" || /[\n\r]/ig.test(data) )
		return;
	pathParams = data.split("?");
	if ( pathParams.length > 2 ) {
		return;
	}
	data                  = pathParams[0];
	pathParams            = pathParams[1];
	output.withQueryParam = !!pathParams;
	try {
		
		let parsed = data.split("/");
		parsed.shift()
		if ( parsed.length )
			output.childs.push(
				{
					type  : "Path",
					data  : data,
					childs: parsed.map(
						item => ({
								type  : "PathItem",
								data  : item,
								childs: [{
									data: qs.parse("value=" + item).value
								}]
							}
						)
					)
				}
			)
		if ( pathParams )
			output.childs.push(
				{
					data: pathParams
				}
			)
	} catch ( e ) {
		
		return false;
	}
	return output;
}
