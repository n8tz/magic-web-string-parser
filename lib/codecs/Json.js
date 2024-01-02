import is from "is";

const objProto = ({}).__proto__;

export const priority = 15;

export const weight = 100;

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
	else if ( data.type === ((data.prefix || "") + "ArrayItem") ) {
		obj = newRawValue || data.newValue || stringify(data.childs[0], options, stringifyAny)
	}
	else if ( data.type === ((data.prefix || "") + "Array") ) {
		obj = [];
		if ( data.newValue )
			obj = data.newValue;
		else if ( newRawValue )
			obj = newRawValue;
		else
			data.childs.forEach(
				( node, i ) => (
					obj[i] = stringify(node.childs[0], options, stringifyAny)
				)
			)
		//obj = newRawValue || data.childs.map(
		//	obj => (stringify(obj, options, stringifyAny))
		//)
	}
	else if ( data.type === "Prop" ) {
		//if ( data.childs[0].newRawValue ) {
		try {
			newRawValue = data.childs[0].newRawValue
			              ? JSON.parse(data.childs[0].newRawValue)
			              : false;
		} catch ( e ) {
			console.log('stringify::Json', "raw value parse error", data.childs[0].newRawValue);
		}
		//}
		obj = newRawValue || data.childs[0]?.newValue || stringify(data.childs[0], options, stringifyAny)
	}
	else if ( data.type === ((data.prefix || "") + "Object") ) {
		obj = {};
		if ( data.newValue )
			obj = data.newValue;
		else if ( newRawValue )
			obj = newRawValue;
		else
			data.childs.forEach(
				( node ) => {
					let rawValue;
					try {
						rawValue = node.childs[0].newRawValue
						           ? JSON.parse(node.childs[0].newRawValue)
						           : false;
					} catch ( e ) {
						console.log('stringify::Json', "raw value parse error", node.childs[0].newRawValue);
					}
					obj[node.key] = rawValue || stringify(node.childs[0], options, stringifyAny)
					
				}
			)
	}
	else
		obj = newRawValue || stringifyAny(data, options);
	return obj;
}

export function parse( { data, prefix = "Json", isRecursive }, options, codecs, parseAny ) {
	let output = {
		type  : prefix,
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
			output.data = data;
		}
		else {
			return false;
		}
		//console.log('parse::parse:83: ', parsed);
		if ( Array.isArray(parsed) ) {
			output.childs.push(
				{
					type  : prefix + "Array",
					prefix,
					data  : !is.string(data) ? JSON.stringify(data) : data,
					childs: parsed
						.map(
							value => {
								return {
									type  : prefix + "ArrayItem",
									childs: [!is.string(value)
									         ? parse({
										                 prefix,
										                 data       : value,
										                 isRecursive: true
									                 }, options, codecs, parseAny) ||
										         {
											         data: value
										         }
									         : {
											data: value
										}
									]
								}
							}
						)
				}
			)
		}
		else if ( parsed.__proto__ === objProto ) {
			output.childs.push(
				{
					type  : prefix + "Object",
					prefix,
					data  : !is.string(data) ? JSON.stringify(data) : data,
					childs: Object.keys(parsed)
					              .map(
						              key => {
							              return {
								              type  : "Prop",
								              key,
								              childs: [
									              !is.string(parsed[key])
									              ? parse({
										                      prefix, data: parsed[key],
										                      isRecursive : true
									                      }, options, codecs, parseAny)
										              || {
											              data: parsed[key]
										              }
									              : {
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

