import is from "is";
import qs from "qs";

const typeTest = /^\??[^\s=\/\\]+(\=[^\s\=\&]*)?(\&[^\s=\/\\]+(\=[^\s=\&]*)?)*$/i;

export const priority = 14;

export function stringify( data, options, stringifyAny ) {
	if ( data.type === "Qs" ) {
		let obj = stringifyAny(data.childs[0], options, "Json")
		return (data.prefix || "") + qs.stringify(obj, { encodeValuesOnly: true });
	}
	return "";
}

export function parse( { data }, options, codecs ) {
	let output = {
		type  : "Qs",
		childs: []
	};
	if ( !is.string(data) || !typeTest.test(data) || /[\n\r]/ig.test(data) ) {
		return false;
	}
	if ( data.startsWith('?') ) {
		output.prefix = "?";
		data          = data.substr(1);
	}
	try {
		let parsed = qs.parse(data, { allowPrototypes: true });
		if ( Object.values(parsed).join("") === "" && Object.values(parsed).length < 2 )
			return false;
		output.childs.push(
			codecs.Json.parse({ data: parsed, prefix: "Qs" }, options, codecs, true)
		);
		return output;
	} catch ( e ) {
		//console.log('parse::parse:39: ', e);
		return false;
	}
	
}
