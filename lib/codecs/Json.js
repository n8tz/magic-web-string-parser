import is from "is";

const objProto = ({}).__proto__;

export const priority = 10;

export function stringify( data, options, stringifyAny ) {
	let obj = { __proto__: null }, newRawValue;
	if ( data.newRawValue ) {
		try {
			newRawValue = data.newRawValue
			              ? JSON.parse(data.newRawValue)
			              : false;
		} catch ( e ) {
			console.log('stringify::Json', "raw value parse error", data.newRawValue);
		}
	}
	if ( data.type === "Json" ) {
		obj = data.newValue || JSON.stringify(newRawValue !== undefined
		                                      ? newRawValue
		                                      : stringify(data.childs[0], options, stringifyAny))
	}
	else if ( data.type === "jsonArray" ) {
		obj = newRawValue || data.childs.map(
			obj => (stringify(obj, options, stringifyAny))
		)
	}
	else if ( data.type === "jsonObject" ) {
		obj = {};
		if ( data.newValue )
			obj = data.newValue;
		else if ( newRawValue )
			obj = newRawValue;
		else
			data.childs.forEach(
				( node ) => (
					obj[node.key] = stringify(node.childs[0], options, stringifyAny)
				)
			)
	}
	else
		obj = newRawValue || stringifyAny(data, options);
	return obj;
}

export function parse( { data }, options, codecs, isRecursive ) {
	let output = {
		type  : "Json",
		childs: []
	};
	try {
		let parsed;
		if ( Array.isArray(data) )
			parsed = data;
		else if ( data.__proto__ === objProto )
			parsed = data;
		else if ( is.string(data) ) {
			parsed      = JSON.parse(data);
			isRecursive = false;
		}
		else {
			return false;
		}
		if ( Array.isArray(parsed) ) {
			output.childs.push(
				{
					type  : "jsonArray",
					childs: parsed
						.map(
							value => {
								return parse({ data: value }, options, codecs, true) || {
									data: value
								}
							}
						)
				}
			)
		}
		else if ( parsed.__proto__ === objProto ) {
			output.childs.push(
				{
					type  : "jsonObject",
					data  : !is.string(data) ? JSON.stringify(data) : data,
					childs: Object.keys(parsed)
					              .map(
						              key => {
							              return {
								              type  : "prop",
								              key,
								              childs: [
									              parse({ data: parsed[key] }, options, codecs, true) || {
										              data: parsed[key]
									              }
								              ]
							              }
						              }
					              )
				}
			)
		}
		else {
			return false
		}
		return isRecursive ? output.childs[0] : output;
	} catch ( e ) {
		return false;
	}
	
}

