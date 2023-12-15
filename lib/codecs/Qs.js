import is from "is";
import qs from "qs";

const typeTest = /^\??[^\s=\/\\]+(\=[^\s\=\&]*)?(\&[^\s=\/\\]+(\=[^\s=\&]*)?)*$/i;

export const priority = 14;

export function stringify( data, options, stringifyAny ) {
	if ( data.type === "Qs" ) {
		let obj = stringifyAny(data.childs[0], options, "Json")
		return (data.prefix || "") + qs.stringify(obj);
	}
	return "";
}

export function parse( { data }, options, codecs ) {
	let output = {
		type  : "Qs",
		childs: []
	};
	//console.log('parse::parse:21: ', "/" + data + "/", !typeTest.test(data));
	if ( !is.string(data) ) {
		//console.log('parse::parse:25: !is.string(data)', !is.string(data));
		return false;
	}
	if ( !typeTest.test(data) ) {
		//console.log('parse::parse:29: !typeTest.test(data.trim())', !typeTest.test(data));
		return false;
	}
	if ( /[\n\r]/ig.test(data) ) {
		//console.log('parse::parse:33:/[\\n\\r]/ig.test(data) ', /[\n\r]/ig.test(data));
		return false;
	}
	//console.log('parse::parse:30: ', data);
	//typeTest.test(data.trim());
	if ( data.startsWith('?') ) {
		output.prefix = "?";
		data          = data.substr(1);
	}
	try {
		let parsed = qs.parse(data, { allowPrototypes: true });
		//console.log('parse::parse:31: ', parsed, Object.values(parsed).join(""), Object.values(parsed).length);
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
