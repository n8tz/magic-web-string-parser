import is from "is";
import qs from "qs";

const typeTest = /^([\w\d\-_\[\]\.]+\s*\=\s*[^\s\;\&]*)(\s*;\s*[\w\d\-_\[\]\.]+\s*\=\s*[^\s\&\;]*)*$/i;

export const priority = 11;

export function stringify( data, options, stringifyAny ) {
	if ( data.type === "KeyValue" ) {
		let obj = stringifyAny(data.childs[0], options, "Json")
		return (data.prefix || "") + qs.stringify(obj, { delimiter: '; ' });
	}
	return "";
}

export function parse( { data }, options, codecs, parseAny ) {
	let output = {
		type  : "KeyValue",
		childs: []
	};
	if ( !is.string(data) || !typeTest.test(data) || /[\n\r]/ig.test(data) )
		return false;
	try {
		data       = data.replace(/;\s/ig, ";")
		let parsed = qs.parse(data, { allowPrototypes: true, delimiter: ';' });
		if ( !Object.values(parsed).join("") && Object.values(parsed).length < 2 )
			return;
		output.childs.push(
			codecs.Json.parse({
				                  data: parsed, prefix: "KeyValue",
				                  weight              : 2,
				                  isRecursive         : true
			                  }, options, codecs, parseAny)
		);
		return output;
	} catch ( e ) {
		return false;
	}
	
}
