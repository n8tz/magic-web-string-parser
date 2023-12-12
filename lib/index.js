import codecs     from "./codecs/(*).js";
import hash       from "hash.js";
import {JSONPath} from "jsonpath-plus";
import is         from "is";

const nativeTypes = ["String", "Number", "Boolean", "Null", "undefined"];
const api         = {
	get( path ) {
		let nodes    = JSONPath({ path, json: this.jsonPathRoot }),
		    selected = [],
		    output   = [];
		nodes.forEach(
			node => {
				node = Array.isArray(node) ? node[0] : node;
				selected.push(node)
			}
		)
		return selected;
	},
	set( path, value, enumerate, raw ) {
		let nodes    = JSONPath({ path, json: this.jsonPathRoot }),
		    selected = [],
		    output   = [];
		nodes.forEach(
			node => {
				node = Array.isArray(node) ? node[0] : node;
				if ( node?.__path ) {
					if ( node?.key )
						node.key = value;
					else
						node.data = value;
					selected.push(this.nodesByPath[node.__path])
				}
			}
		)
		selected.forEach(
			node => {
				let oKey;
				if ( node?.key ) {
					oKey     = node.key;
					node.key = value;
				}
				else {
					if ( raw )
						node.newRawValue = value
					else
						node.newValue = value
				}
				if ( enumerate ) {
					output.push(stringify(this))
					
					if ( node?.key )
						node.key = oKey;
					else {
						delete node.newValue;
						delete node.newRawValue;
					}
				}
			}
		)
		return enumerate ? output : stringify(this);
	},
	printStats() {
		let output = "",
		    cNode,
		    types  = Object.keys(this.nodesByType);
		
		for ( let type of types ) {
			output += type + Array(15 - type.length).join(" ") + ": " +
				this.nodesByType[type].length +
				" items\n";
		}
		
		return output;
	},
	
	printVars() {
		let output = [""],
		    cNode,
		    stack  = [this.root];
		while ( stack.length ) {
			cNode = stack.shift();
			if ( cNode.isPropValueOf ) {
				output.push(cNode.isPropValueOf + Array(15 - cNode.isPropValueOf.length).join(" ") + "= " +
					            (cNode.newRawValue || JSON.stringify((cNode.newValue || cNode.data)))
				);
			}
			cNode.childs && stack.unshift(...cNode.childs);
		}
		return output.join("\n");
	},
	
	printVarTree() {
		let output = "",
		    cNode,
		    stack  = [this.root];
		while ( stack.length ) {
			cNode = stack.shift();
			if ( !cNode.isPropValueOf )
				output += cNode.path.split(".").map(p => " ").join("") + cNode.pathKey + (cNode.key
				                                                                          ? " " + cNode.key + " = "
				                                                                          : "") + "\n";
			else
				output += cNode.path.split(".").map(p => " ").join("") + cNode.pathKey + " ( " + cNode.type + " ) " + "\n";
			
			if ( cNode.data || cNode.newValue || cNode.newRawValue )
				output += cNode.path.split(".").map(p => " ").join("") + " - " +
					(cNode.newRawValue || JSON.stringify((cNode.newValue || cNode.data))) +
					"\n";
			cNode.childs && stack.unshift(...cNode.childs);
		}
		return output;
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
			               ? "String"
			               : is.number(current.data)
			                 ? "Number"
			                 : is.bool(current.data)
			                   ? "Boolean"
			                   : current.data === null
			                     ? "Null"
			                     : current.data === undefined
			                       ? "undefined"
			                       : "undefined";
		if ( current.type === "Prop" ) {
			paramHashData.push(current.key);
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
				isLeaf: !!nativeTypes.includes(current.type)
			}]
		}
		if ( !current.isPropValueOf ) {
			currentJsonPathObj[current.type] = currentJsonPathObj[current.type] || [];
			currentJsonPathObj[current.type].push(
				nextJsonPathObj = {
					__path: currentJsonPathObj.__path + "." + current.type + "[" + currentJsonPathObj[current.type].length + "]",
					__key : current.type + "[" + currentJsonPathObj[current.type].length + "]",
					__type: current.type,
					isLeaf: !!nativeTypes.includes(current.type)
				});
		}
		nextJsonPathObj.data                       = current.data;
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

function stringifyAny( data, options, forceCodecId ) {
	let output = "",
	    parsedItem;
	
	if ( data.newValue ) {
		output = data.newValue;
	}
	else if ( nativeTypes.includes(data.type) ) {
		output = data.data;
	}
	else if ( codecs[forceCodecId || data.type] ) {
		parsedItem = codecs[forceCodecId || data.type].stringify(data, options, stringifyAny);
		if ( parsedItem ) {
			output = parsedItem;
		}
	}
	else {
		console.log('Unknown what to do with ', data, forceCodecId);
		process.exit(1)
	}
	
	
	return output
}

