import codecs     from "./codecs/(*).js";
import hash       from "hash.js";
import {JSONPath} from "jsonpath-plus";
import is         from "is";

const nativeTypes = ["String", "Number", "Boolean", "Null", "undefined"];
const api         = {
	get( path ) {
		let nodes    = JSONPath({ path, json: this.jsonPathRoot }),
		    selected = [];
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
	stringify: function ( options ) {
		return stringify(this, options)
	},
	printStats() {
		let output = "",
		    cNode,
		    types  = Object.keys(this.nodesByType);
		
		for ( let type of types ) {
			output += type + Array(Math.max(20 - type.length, 2)).join(" ") + ": " +
				this.nodesByType[type].length +
				" items\n";
		}
		
		return output;
	},
	
	printVars( withPath ) {
		let output = [""],
		    cNode,
		    stack  = [this.root];
		while ( stack.length ) {
			cNode = stack.shift();
			if ( cNode.isPropValueOf ) {
				!cNode.__humanPath && console.log('api::printVars:87: ', cNode);
				if ( withPath )
					output.push(cNode.__humanPath + Array(Math.max(30 - cNode.__humanPath.length, 2)).join(" ") + "= " +
						            (cNode.newRawValue || JSON.stringify((cNode.newValue || cNode.data)))
						            + " ( " + cNode.__path + " )"
					)
				else
					output.push(cNode.isPropValueOf + Array(Math.max(20 - cNode.isPropValueOf.length, 2)).join(" ") + "= " +
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
		    stack  = [this.root],
		    val;
		while ( stack.length ) {
			cNode = stack.shift();
			if ( !cNode.isPropValueOf )
				output += cNode.__path.split(".").map(p => " ").join("")
					+ cNode.pathKey
					+ (cNode.variation
					   ? " ( " + cNode.variation + " ) "
					   : "")
					+ (cNode.key
					   ? " " + cNode.key + " = "
					   : "")
					+ "\n";
			else
				output += cNode.__path.split(".").map(p => " ").join("") + cNode.pathKey + " ( " + cNode.type + " ) " + "\n";
			if ( cNode.data !== undefined || cNode.newValue !== undefined || cNode.newRawValue !== undefined )
				output += cNode.__path.split(".").map(p => " ").join("") + " - " +
					(
						cNode.newRawValue !== undefined
						? cNode.newRawValue
						: JSON.stringify((cNode.newValue !== undefined ? cNode.newValue : cNode.data))
					) +
					"\n";
			cNode.childs && stack.unshift(...cNode.childs);
		}
		output += "\n" + this.structureHash + "\n";
		return output;
	}
}

export const parsers = codecs;

export function parse( data, options, context ) {
	let codecList          = Object.keys(codecs).sort(( a, b ) => (codecs[b].priority - codecs[a].priority)),
	    root               = {
		    baseType : context?.baseType,
		    data     : data,
		    childs   : [],
		    variation: context?.variation
	    },
	    jsonPathRoot       = { __path: "$", __humanPath: "/" },
	    output             = {
		    __proto__           : api,
		    root,
		    jsonPathRoot,
		    nodesByPath         : {},
		    nodesByType         : {},
		    totalNodes          : 0,
		    totalNodesWeight    : 0,
		    totalNativeTypeNodes: 0
	    },
	    toParse            = [root],
	    toParseJsonPathObj = [jsonPathRoot],
	    paramHashData      = [],
	    current,
	    currentJsonPathObj,
	    nextJsonPathObj,
	    parsedOption,
	    tryDecode          = ( codecId, current, options ) => {
		    let parsedItem;
		    parsedItem = codecs[codecId].parse(current, options, codecs, parse);
		    if ( parsedItem ) {
			    Object.assign(current, parsedItem);
			    current.type = codecId;
			    return parsedItem;
		    }
		    return false;
	    },
	    alternatives;
	
	do {
		current            = toParse.shift();
		currentJsonPathObj = toParseJsonPathObj.shift();
		output.totalNodes++;
		if ( !current.type ) {
			if ( current.baseType ) {
				tryDecode(current.baseType, current, options);
				delete current.baseType;
			}
			else {
				alternatives = [];
				for ( let codecId of codecList ) {
					if ( codecs[codecId].variations ) {
						for ( let variation of codecs[codecId].variations ) {
							parsedOption = parse(current.data, options, { baseType: codecId, variation });
							alternatives.push(parsedOption)
						}
					}
					else {
						parsedOption = parse(current.data, options, { baseType: codecId })
						//console.log('parse::parse:186: ', codecId, parsedOption.totalNodesWeight);
						alternatives.push(parsedOption);
					}
				}
				alternatives = alternatives.sort(
					( a, b ) => (
						b.totalNodesWeight
						-
						a.totalNodesWeight
					)
				)
				if ( alternatives?.[0]?.root ) {
					Object.assign(current, alternatives?.[0].root);
				}
			}
		}
		if ( !current.type ) {
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
		}
		let isNative = !!nativeTypes.includes(current.type);
		isNative && output.totalNativeTypeNodes++;
		if ( codecs[current.type] )
			output.totalNodesWeight += (codecs[current.type]?.weight || 1);
		
		if ( current.type === "Prop" ) {
			output.totalNodesWeight += 10;
			current.childs[0].isPropValueOf = current.key;
		}
		else {
		}
		if ( current.isPropValueOf ) {
			paramHashData.push(current.isPropValueOf + ":" + current.type)
			currentJsonPathObj.key = current.isPropValueOf;
			if ( isNative ) {
				currentJsonPathObj.value = [nextJsonPathObj = {
					__path     : currentJsonPathObj.__path + ".value[0]",
					__humanPath: (currentJsonPathObj.__humanPath) + "/" + current.isPropValueOf,
					__key      : "value[0]",
					__type     : current.type,
					value      : !!nativeTypes.includes(current.type) ? current.data : undefined,
					isLeaf     : !!nativeTypes.includes(current.type)
				}];
				
				current.__path      = nextJsonPathObj.__path;
				current.__humanPath = nextJsonPathObj.__humanPath;
				current.pathKey     = nextJsonPathObj.__key;
			}
			else {
				//if (!current.__humanKey)
				//	console.log('parse::parse:213: ', current);
				currentJsonPathObj.value                                    = [
					{
						__path        : currentJsonPathObj.__path + ".value[0]",
						__humanPath   : (currentJsonPathObj.__humanPath) + "/" + current.isPropValueOf,
						__key         : "value[0]",
						__type        : current.type,
						[current.type]: [
							nextJsonPathObj = {
								__path     : currentJsonPathObj.__path + ".value[0]" + "." + current.type + "[0]",
								__humanPath: (currentJsonPathObj.__humanPath) + "/" + current.isPropValueOf +
									(
										current.__humanKey
										? "/" + current.__humanKey
										: codecs[current.type]
										  ? "/" + current.type
										  : current.type.endsWith("Item")
										    ? "/" + current.type + "[0]"
										    : ""
									),
								__key      : current.type + "[0]",
								__type     : current.type
							}
						]
					}];
				output.nodesByPath[currentJsonPathObj.__path + ".value[0]"] = current;
				
				current.__path      = currentJsonPathObj.__path + ".value[0]";
				current.__humanPath = (currentJsonPathObj.__humanPath) + "/" + current.isPropValueOf;
				current.pathKey     = nextJsonPathObj.__key;
			}
		}
		else if ( !current.isPropValueOf ) {
			currentJsonPathObj[current.type] = currentJsonPathObj[current.type] || [];
			currentJsonPathObj[current.type].push(
				nextJsonPathObj = {
					__path     : currentJsonPathObj.__path + "." + current.type + "[" + currentJsonPathObj[current.type].length + "]",
					__humanPath: (currentJsonPathObj.__humanPath) +
						(
							current.__humanKey
							? "/" + current.__humanKey
							: codecs[current.type]
							  ? "/" + current.type
							  : current.type.endsWith("Item")
							    ? "/" + current.type + "[" + currentJsonPathObj[current.type].length + "]"
							    : ""
						),
					__key      : current.type + "[" + currentJsonPathObj[current.type].length + "]",
					__type     : current.type,
					isLeaf     : !!nativeTypes.includes(current.type)
				});
			current.__path      = nextJsonPathObj.__path;
			current.__humanPath = nextJsonPathObj.__humanPath;
			current.pathKey     = nextJsonPathObj.__key;
		}
		nextJsonPathObj.data                       = current.data;
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

