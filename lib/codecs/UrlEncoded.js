import is from "is";
import qs from "qs";

const notTypeTest = /[^\=\&\\\/\[\]]/ig,
      typeTest    = /\%[\w\d][\w\d]/ig;

export const priority = -20;
export const weight   = 0;

export function stringify( data, options, stringifyAny ) {
	let obj;
	if ( data.type === "UrlEncoded" ) {
		if ( data.newValue )
			obj = qs.stringify({ value: data.newValue }).split("value=")[1];
		else
			obj = qs.stringify({ value: stringifyAny(data.childs[0], options) }).split("value=")[1];
	}
	return obj
}

export function parse( { data, notBase64 }, options, codecs, parseAny ) {
	if ( !is.string(data) )
		return;
	
	let output = {
		type  : "UrlEncoded",
		childs: [],
		data,
		length: data.length
	};
	
	if ( notTypeTest.test(data) || !typeTest.test(data) )
		return;
	try {
		let parsed = decodeURIComponent(data);
		output.childs.push(
			{
				data: parsed
			}
		)
	} catch ( e ) {
		
		return false;
	}
	return output;
}
