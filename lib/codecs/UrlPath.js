import qs from "qs";


export function stringify( data, options, stringifyAny ) {
	let obj, nodes = data.childs, params;
	if ( data.type === "UrlPath" ) {
		if ( data.withQueryParam ) {
			params = nodes[nodes.length - 1];
			nodes  = nodes.slice(0, nodes.length - 1);
		}
		obj = "/" + nodes.map(node => qs.stringify({ value: stringifyAny(node, options) }).split("value=")[1]).join("/")
			+ (params ? "?" + stringifyAny(params, options) : "")
	}
	return obj;
}

export function parse( { data }, options, codecs ) {
	let output = {
		    type  : "UrlPath",
		    childs: []
	    },
	    pathParams;
	if ( !data || data[0] !== "/" )
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
				...parsed.map(
					item => ({
							data: qs.parse("value=" + item).value
						}
					)
				)
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
