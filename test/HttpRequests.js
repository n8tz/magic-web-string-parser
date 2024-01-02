const assert = require('assert'),
      mwsp   = require('../'),
      fs     = require('fs/promises');
describe('HttpRequests', function () {
	describe('GET Request', function () {
		it('should mount All GET Request', async function () {
			let reqDir   = __dirname + '/HttpRequests/get',
			    requests = await fs.readdir(reqDir),
			    lastReq,
			    results  = [],
			    fails;

			for ( let file of requests ) {
				lastReq = await fs.readFile(reqDir + "/" + file);
				try {
					results.push(mwsp.parse(lastReq + ""))
					//console.log(':::51: ', results[results.length-1].printVarTree());
				} catch ( e ) {
					results.push({ message: "Request " + file + " fail : \n" + lastReq + "\n\n" + e, error: e })
				}
			}
			for ( let res in results ) {
				results[res] = !results[res].error
				               ? !results[res].get("$..HttpRequest").length && { message: "Request " + requests[res] + " fail ( Object is missing ) :\n\n" + results[res].printStats() + "\n" }
				               : results[res];
				fails        = fails || results[res];
			}


			assert.deepEqual(fails, false, "\n" + results.map(r => r.message).join("\n"));
		});
	});
	describe('POST Request', function () {
		it('should mount All POST Request', async function () {
			let reqDir   = __dirname + '/HttpRequests/post',
			    requests = await fs.readdir(reqDir),
			    lastReq,
			    results  = [],
			    fails;
			
			//console.log(':::8: ', requests);
			for ( let file of requests ) {
				lastReq = await fs.readFile(reqDir + "/" + file);
				try {
					results.push(mwsp.parse(lastReq + ""))
					//console.log(':::51: ', results[results.length-1].get("$..Prop.*.value"));
				} catch ( e ) {
					results.push({ message: "Request " + file + " fail : \n" + lastReq + "\n\n" + e, error: e })
				}
			}
			for ( let res in results ) {
				
				results[res] = !results[res].error
				               ? !results[res].get("$..HttpRequestBody").length && { message: "Request " + requests[res] + " fail ( Object is missing ) :\n\n" + results[res].printStats() + "\n" }
				               : results[res];
				fails        = fails || results[res];
			}
			
			
			assert.deepEqual(fails, false, "\n" + results.map(r => r.message).join("\n"));
		});
	});
});
