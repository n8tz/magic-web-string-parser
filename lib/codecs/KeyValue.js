import is from "is";
import qs from "qs";

const typeTest = /^([^\s\?\=\;\&]+\s*\=\s*[^\s\;]+)(\s*;\s*[^\s\=\;\&]+\s*\=\s*[^\s\&\;]+)*$/i;

export const priority = 11;

export function stringify( data, options, stringifyAny ) {
	if ( data.type === "KeyValue" ) {
		let obj = stringifyAny(data.childs[0], options, "Json")
		return (data.prefix || "") + qs.stringify(obj, { delimiter: '; ' });
	}
	return "";
}

export function parse( { data }, options, codecs ) {
	let output = {
		type  : "KeyValue",
		childs: []
	};
	if ( !is.string(data) || !typeTest.test(data.trim()) || /[\n\r]/ig.test(data) )
		return false;
	try {
		data       = data.replace(/;\s/ig, ";")
		let parsed = qs.parse(data, { allowPrototypes: true, delimiter: ';' });
		output.childs.push(
			codecs.Json.parse({ data: parsed, prefix: "KeyValue" }, options, codecs, true)
		);
		return output;
	} catch ( e ) {
		return false;
	}
	
}
