import codecs from "./codecs/(*).js";

export function parse( data, options ) {
	let root          = {
		    //type  : "string",
		    data  : data,
		    childs: []
	    },
	    output        = {
		    root,
		    propsByPath     : {},
		    leafsByPath     : {},
		    valuesByPath    : {},
		    nodesByKey      : {},
		    stringNodesByKey: {},
		    nodesByType     : {}
	    },
	    
	    toParse       = [root],
	    toParsePath   = [["#root"]],
	    paramHashData = [],
	    current,
	    currentPath,
	    parsedItem;
	
	do {
		current     = toParse.shift();
		currentPath = toParsePath.shift();
		if ( !current.type ) {
			for ( let codecId in codecs ) {
				parsedItem = codecs[codecId].parse(current, options, codecs);
				if ( parsedItem ) {
					Object.assign(current, parsedItem);
					current.type = codecId;
					break;
				}
			}
		}
		
		current.type = current.type || "string";
		if ( current.type === "prop" ) {
			output.propsByPath[currentPath.join(".") + ":" + current.key] = current;
			paramHashData.push(current.key)
			output.nodesByKey[current.key] = output.nodesByKey[current.key] || [];
			output.nodesByKey[current.key].push(current);
			current.childs[0].isPropValueOf = current.key;
		}
		else if ( current.type === "string" ) {
			output.leafsByPath[currentPath.join(".")] = current;
			if ( !current.alternate )
				output.valuesByPath[currentPath.join(".")] = current.data;
			if ( current.isPropValueOf ) {
				output.stringNodesByKey[current.isPropValueOf] = output.stringNodesByKey[current.isPropValueOf] || [];
				output.stringNodesByKey[current.isPropValueOf].push(current);
			}
		}
		output.nodesByType[current.type] = output.nodesByType[current.type] || [];
		output.nodesByType[current.type].push(current);
		if ( current.childs ) {
			toParse.push(...current.childs);
			toParsePath.push(...current.childs.map(( v, i ) => ([...currentPath, current.type + "[" + i + "]"])));
		}
	} while ( toParse.length );
	output.paramHashData = paramHashData;
	return output
}

export function stringify( data, options ) {
	return stringifyAny(data.root || data, options)
}

function stringifyAny( data, options ) {
	let output = "",
	    parsedItem;
	
	if ( data.newValue ) {
		output += data.newValue;
	}
	else if ( data.type === "string" ) {
		output += data.data;
	}
	else if ( codecs[data.type] ) {
		parsedItem = codecs[data.type].stringify(data, options, stringifyAny);
		if ( parsedItem ) {
			output += parsedItem;
		}
	}
	else {
		console.log('Unknown what to do with ', data);
		process.exit(1)
	}
	
	
	return output
}
