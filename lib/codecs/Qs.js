import is from "is";
import qs from "qs";

const typeTests = {
	"&": /^\??[^\s=\/\\\;\,\&]+(\=[^\s\=\&]*)?(\&[^\s=\/\\\;\,\&]+(\=[^\s=\&]*)?)*$/i,
	"$": /^\$?[^\s=\/\\\;\,\$]+(\=[^\s\=\$]*)?(\$[^\s=\/\\\;\,\$]+(\=[^\s=\$]*)?)*$/i,
	"|": /^\|?[^\s=\/\\\;\,\|]+(\=[^\s\=\|]*)?(\|[^\s=\/\\\;\,\|]+(\=[^\s=\|]*)?)*$/i
};

export const priority   = 14;
export const variations = ['&', '$', '|'];

export const weight = 10;

export function stringify( data, options, stringifyAny ) {
	if ( data.type === "Qs" ) {
		let obj = stringifyAny(data.childs[0], options, "Json")
		return (data.prefix || "") + qs.stringify(obj, {
			encodeValuesOnly: true,
			delimiter       : data.separator,
			allowDots       : data.allowDots
		});
	}
	return "";
}

export function parse( { data, variation }, options, codecs, parseAny ) {
	let output = {
		    type  : "Qs",
		    childs: []
	    },
	    separator;
	if ( is.string(data) && typeTests[variation].test(data) )// should mk some global heuristic
	{
		output.separator = separator = variation;
	}
	if ( !is.string(data) || !separator || /[\n\r]/ig.test(data) ) {
		return false;
	}
	if ( data.startsWith('?') ) {
		output.prefix = "?";
		data          = data.substr(1);
	}
	if ( data.startsWith(separator) ) {
		output.prefix = separator;
		data          = data.substr(1);
	}
	try {
		let parsed = qs.parse(data, { allowPrototypes: true, delimiter: separator });
		if ( Object.values(parsed).join("") === "" )// if no values consider is false pos
			return false;
		if ( Object.keys(parsed).filter(key => key.includes('.')).length )// if dot use dot
		{
			output.allowDots = true;
			parsed           = qs.parse(data, { allowPrototypes: true, delimiter: separator, allowDots: true });
		}
		output.childs.push(
			codecs.Json.parse({
				                  data       : parsed,
				                  prefix     : "Qs",
				                  isRecursive: true
			                  }, options, codecs, parseAny)
		);
		return output;
	} catch ( e ) {
		//console.log('parse::parse:39: ', e);
		return false;
	}
	
}
