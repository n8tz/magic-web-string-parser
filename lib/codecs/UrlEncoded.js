import qs from "qs";

const typeTest = /^\??[^=\&]+(\=[^=\&]+)?(\&[^=\&]+(\=[^=\&]+)?)+/ig;

export function stringify( data, options, stringifyAny ) {
	if ( data.type === "UrlEncoded" ) {
		//console.log('stringify::stringify:8: ', JSON.stringify(data.childs[0]));
		let obj = JSON.parse(stringifyAny(data.childs[0], options))
		return (data.prefix || "") + qs.stringify(obj);
	}
	return "";
}

export function parse( { data }, options, codecs ) {
	let output = {
		type  : "UrlEncoded",
		childs: []
	};
	if ( !typeTest.test(data) )
		return false;
	if ( data.startsWith('?') ) {
		output.prefix = "?";
		data          = data.substr(1);
	}
	try {
		let parsed = qs.parse(data, { allowPrototypes: true });
		output.childs.push(
			codecs.Json.parse({ data: JSON.stringify(parsed) })
		);
		return output;
	} catch ( e ) {
		return false;
	}
	
}
