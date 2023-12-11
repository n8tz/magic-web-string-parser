import codecs     from "./codecs/(*).js";
import hash       from "hash.js";
import {JSONPath} from "jsonpath-plus";
import is         from "is";

const nativeTypes = ["string", "number", "boolean", "null", "undefined"];
const api         = {
	set( path, value, raw ) {
		let nodes    = JSONPath({ path, json: this.jsonPathRoot }),
		    selected = [];
		nodes.forEach(
			node => {
				node = Array.isArray(node) ? node[0] : node;
				if ( node.__path ) {
					selected.push(this.nodesByPath[node.__path])
				}
			}
		)
		selected.forEach(
			node => {
				if ( raw )
					node.newRawValue = value
				else
					node.newValue = value
			}
		)
	}
}

export function parse( data, options ) {
	let codecList          = Object.keys(codecs).sort(( a, b ) => (codecs[b].priority - codecs[a].priority)),
	    root               = {
		    //type  : "string",
		    data  : data,
		    childs: []
	    },
	    jsonPathRoot       = { __path: "$" },
	    output             = {
		    __proto__  : api,
		    root,
		    jsonPathRoot,
		    nodesByPath: {},
		    nodesByType: {}
	    },
	    
	    toParse            = [root],
	    toParseJsonPathObj = [jsonPathRoot],
	    paramHashData      = [],
	    current,
	    currentJsonPathObj,
	    nextJsonPathObj,
	    parsedItem;
	do {
		current            = toParse.shift();
		currentJsonPathObj = toParseJsonPathObj.shift();
		if ( !current.type ) {
			for ( let codecId of codecList ) {
				parsedItem = codecs[codecId].parse(current, options, codecs);
				if ( parsedItem ) {
					Object.assign(current, parsedItem);
					current.type = codecId;
					break;
				}
			}
		}
		if ( !current.type )
			current.type = is.string(current.data)
			               ? "string"
			               : is.number(current.data)
			                 ? "number"
			                 : is.bool(current.data)
			                   ? "boolean"
			                   : current.data === null
			                     ? "null"
			                     : current.data === undefined
			                       ? "undefined"
			                       : "undefined";
		if ( current.type === "prop" ) {
			paramHashData.push(current.key)
			current.childs[0].isPropValueOf = current.key;
		}
		else {
			paramHashData.push(current.type)
		}
		if ( current.isPropValueOf ) {
			currentJsonPathObj.key   = current.isPropValueOf;
			currentJsonPathObj.value = [nextJsonPathObj = {
				__path: currentJsonPathObj.__path + ".value",
				__key : "value",
				__type: current.type,
				value : !!nativeTypes.includes(current.type) ? current.data : undefined,
				native: !!nativeTypes.includes(current.type)
			}]
		}
		if ( !current.isPropValueOf ) {
			currentJsonPathObj[current.type] = currentJsonPathObj[current.type] || [];
			currentJsonPathObj[current.type].push(
				nextJsonPathObj = {
					__path: currentJsonPathObj.__path + "." + current.type + "[" + currentJsonPathObj[current.type].length + "]",
					__key : current.type + "[" + currentJsonPathObj[current.type].length + "]",
					__type: current.type,
					native: !!nativeTypes.includes(current.type)
				});
		}
		current.path                               = nextJsonPathObj.__path;
		current.pathKey                            = nextJsonPathObj.__key;
		output.nodesByPath[nextJsonPathObj.__path] = current;
		output.nodesByType[current.type]           = output.nodesByType[current.type] || [];
		output.nodesByType[current.type].push(current);
		if ( current.childs ) {
			toParse.unshift(...current.childs);
			toParseJsonPathObj.unshift(...current.childs.map(( v, i ) => (nextJsonPathObj)));
		}
	} while ( toParse.length );
	
	output.structureHash = hash.sha256().update(paramHashData.join(",")).digest('hex');
	
	return output
}

export function stringify( data, options ) {
	return stringifyAny(data.root || data, options)
}

function stringifyAny( data, options ) {
	let output = "",
	    parsedItem;
	
	if ( data.newValue ) {
		output = data.newValue;
	}
	else if ( nativeTypes.includes(data.type) ) {
		output = data.data;
	}
	else if ( codecs[data.type] ) {
		parsedItem = codecs[data.type].stringify(data, options, stringifyAny);
		if ( parsedItem ) {
			output = parsedItem;
		}
	}
	else {
		console.log('Unknown what to do with ', data);
		process.exit(1)
	}
	
	
	return output
}

export function printStats( data ) {
	let output = "",
	    cNode,
	    types  = Object.keys(data.nodesByType);
	
	for ( let type of types ) {
		output += type + " : " +
			data.nodesByType[type].length +
			" items\n";
	}
	
	return output;
}

export function printVars( data ) {
	let output = "",
	    cNode,
	    stack  = [data?.root || data];
	while ( stack.length ) {
		cNode = stack.shift();
		if ( cNode.isPropValueOf ) {
			output += cNode.isPropValueOf + "=" +
				JSON.stringify((cNode.newValue || cNode.newRawValue || cNode.data)) +
				"\n";
		}
		cNode.childs && stack.unshift(...cNode.childs);
	}
	return output;
}

export function printVarTree( data ) {
	let output = "",
	    cNode,
	    stack  = [data?.root || data];
	while ( stack.length ) {
		cNode = stack.shift();
		if ( !cNode.isPropValueOf )
			output += cNode.path.split(".").map(p => " ").join("") + cNode.pathKey + (cNode.key
			                                                                          ? " " + cNode.key + " = "
			                                                                          : "") + "\n";
		
		if ( cNode.data || cNode.newValue || cNode.newRawValue )
			output += cNode.path.split(".").map(p => " ").join("") + " - " +
				JSON.stringify((cNode.newValue || cNode.newRawValue || cNode.data)) +
				"\n";
		cNode.childs && stack.unshift(...cNode.childs);
	}
	return output;
}
