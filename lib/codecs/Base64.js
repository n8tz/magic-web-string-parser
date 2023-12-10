import base64js from 'base64-js';

const decoder   = new TextDecoder('UTF-8'),
      encoder   = new TextEncoder('UTF-8');
const typeTest  = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/,
      b64Header = /^(data\:(([^;,]+\/[^;,]+\;)?(base64)?\,)?)(([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?)$/i;

export function stringify( data, options, stringifyAny ) {
	if ( data.type === "Base64" ) {
		if ( data.childs[0].type !== "string" || data.childs[1].type === "string" && data.length >= 12 )// is a b64 result ?
			// hard to know
			return stringifyAny(data.childs[0], options, stringifyAny);
		else
			return (data.dataHeader || "") + base64js.fromByteArray(encoder.encode(stringifyAny(data.childs[1], options, stringifyAny)))
	}
}

export function parse( { data, notBase64 }, options ) {
	let output = {
		    type  : "Base64",
		    childs: [],
		    length: data.length
	    },
	    header = data.match(b64Header);
	if ( notBase64 )
		return;
	if ( header?.[1] ) {
		data              = header[5];
		output.dataHeader = header[1];
	}
	
	if ( !typeTest.test(data) || (!output.dataHeader && data.length <= 12) )
		return;
	try {
		let parsed      = base64js.toByteArray(data),
		    testRecoded = base64js.fromByteArray(encoder.encode(decoder.decode(parsed)));
		if ( testRecoded !== data )
			return false;
		output.childs.push(
			{
				data     : data,
				notBase64: true,
				alternate: true
			},
			{
				data: decoder.decode(parsed)
			}
		)
	} catch ( e ) {
		
		return false;
	}
	return output;
}
