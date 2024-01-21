import is from "is";
import qs from "qs";

export const priority = 8;

export const weight = 20;

export function stringify( data, options, stringifyAny ) {
	let obj, nodes = data.childs, params;
	if ( data.type === "UrlPath" ) {
		//if ( data.withQueryParam ) {
		//	params = nodes[1];
		//}
		obj =
			nodes.map(node => stringify(node, options, stringifyAny)).join("")
		//stringify(nodes[0], options, stringifyAny)
		//+ (params ? "?" + stringifyAny(params, options) : "")
	}
	else if ( data.type === "PathQuery" ) {
		if ( data.newValue )
			obj = "?" + qs.stringify({ value: data.newValue }).split("value=")[1];
		else
			obj = "?" + stringifyAny(nodes[0], options)
	}
	else if ( data.type === "PathHash" ) {
		if ( data.newValue )
			obj = "#" + qs.stringify({ value: data.newValue }).split("value=")[1];
		else
			obj = "#" + stringifyAny(nodes[0], options)
	}
	else if ( data.type === "Path" ) {
		if ( data.newValue )
			obj = data.newValue;
		else
			obj = data.prefix + nodes.map(node => stringify(node, options, stringifyAny)).join("/")
	}
	else if ( data.type === "PathItem" ) {
		if ( data.newValue )
			obj = qs.stringify({ value: data.newValue }).split("value=")[1];
		else if ( data.newRawValue )
			obj = data.newRawValue;
		else
			obj = qs.stringify({ value: data.newValue || stringifyAny(nodes[0], options) }).split("value=")[1]
	}
	return obj;
}

export function parse( { data }, options, codecs, parseAny ) {
	let output = {
		    type  : "UrlPath",
		    childs: []
	    },
	    pathParams,
	    pathHash,
	    seemsToHaveAFileName,
	    seemsToHaveMultipleDirectory,
	    seemsToHaveIllegalCharacters;
	
	if ( !is.string(data) || !data || /[\n\r]/ig.test(data) )
		return;
	
	pathHash             = data.split("#");
	data                 = pathHash.shift();
	pathHash             = pathHash.join("#");
	output.withHashParam = !!pathHash;
	
	pathParams            = data.split("?");
	data                  = pathParams.shift();
	pathParams            = pathParams.join("?");
	output.withQueryParam = !!pathParams;
	
	seemsToHaveAFileName         = /[^\/\.]+\.[^\/\.]{2,5}$/i.test(data);
	seemsToHaveIllegalCharacters = /[\s\{\=\*]/i.test(data);
	seemsToHaveMultipleDirectory = data.split('/').length > 2;
	//console.log('parse::parse:75: ', data, seemsToHaveAFileName, seemsToHaveMultipleDirectory,
	// seemsToHaveIllegalCharacters);
	if ( !(data[0] === "/" || data.startsWith("./")) && !(seemsToHaveAFileName || seemsToHaveMultipleDirectory) || seemsToHaveIllegalCharacters )
		return;
	if ( seemsToHaveIllegalCharacters && !(seemsToHaveAFileName && seemsToHaveMultipleDirectory) )
		return;
	if ( seemsToHaveAFileName && data.split('/').length < 2 )
		return;
	try {
		
		let parsed = data.split("/");
		//
		if ( data[0] === "/" )
			parsed.shift()
		if ( parsed.length )
			output.childs.push(
				{
					type  : "Path",
					data  : data,
					prefix: data[0] === "/" ? "/" : "",
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
					type  : "PathQuery",
					data  : pathParams,
					childs: [{
						data: pathParams
					}]
				}
			)
		if ( pathHash )
			output.childs.push(
				{
					type  : "PathHash",
					data  : pathHash,
					childs: [{
						data: pathHash
					}]
				}
			)
	} catch ( e ) {
		
		return false;
	}
	return output;
}
