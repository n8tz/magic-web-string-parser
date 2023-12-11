import is from "is";
import qs from "qs";

const typeTest = /^\??[^\?\/\=\&]+(\=[^\=\&]+)(\&[^=\&]+(\=[^=\&]+)?)*/ig;

export const priority = 10;

export function stringify( data, options, stringifyAny ) {
	if ( data.type === "Qs" ) {
		//console.log('stringify::stringify:8: ', JSON.stringify(data.childs[0]));
		let obj = JSON.parse(stringifyAny(data.childs[0], options))
		return (data.prefix || "") + qs.stringify(obj);
	}
	return "";
}

export function parse( { data }, options, codecs ) {
	let output = {
		type  : "Qs",
		childs: []
	};
	if ( !is.string(data) || !typeTest.test(data) || /[\n\r]/ig.test(data) )
		return false;
	if ( data.startsWith('?') ) {
		output.prefix = "?";
		data          = data.substr(1);
	}
	try {
		let parsed = qs.parse(data, { allowPrototypes: true });
		output.childs.push(
			codecs.Json.parse({ data: JSON.stringify(parsed) }, options, codecs)
		);
		return output;
	} catch ( e ) {
		return false;
	}
	
}
