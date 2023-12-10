const objProto = ({}).__proto__;

export function stringify( data, options, stringifyAny ) {
	let obj = { __proto__: null };
	if ( data.type === "Json" ) {
		obj = JSON.stringify(stringify(data.childs[0], options, stringifyAny))
	}
	else if ( data.type === "jsonArray" ) {
		obj = data.childs.map(
			obj => (stringify(obj, options, stringifyAny))
		)
	}
	else if ( data.type === "jsonObject" ) {
		obj = {};
		data.childs.forEach(
			( node ) => (
				obj[node.key] = node.data || stringify(node.childs[0], options, stringifyAny)
			)
		)
	}
	else {
		obj = stringifyAny(data, options);
	}
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
		else {
			parsed      = JSON.parse(data);
			isRecursive = false;
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

