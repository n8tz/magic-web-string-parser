const assert = require('assert'),
      mwsp   = require('../'),
      fs     = require('fs/promises');
describe('QS', function () {
	describe('QS with &', function () {
		it('should mount All QS', async function () {
			let reqDir   = __dirname + '/QS',
			    requests = await fs.readdir(reqDir),
			    lastReq,
			    results  = [],
			    fails;
			
			//console.log(':::8: ', requests);
			for ( let file of requests ) {
				lastReq = await fs.readFile(reqDir + "/" + file);
				try {
					results.push(mwsp.parse(lastReq + ""))
				} catch ( e ) {
					results.push({ message: "Request " + file + " fail : \n" + lastReq + "\n\n" + e, error: e })
				}
			}
			for ( let res in results ) {
				//console.log(':::23: ', JSON.stringify(results[res].get("$..PathQuery"),0,2));
				
				results[res] = !results[res].error
				               ? !results[res].get("$..Qs").length && { message: "Request " + requests[res] + " fail ( Object is missing ) :\n\n" + results[res].printStats() + "\n" }
				               : results[res];
				fails        = fails || results[res];
			}
			
			
			assert.deepEqual(fails, false, "\n" + results.map(r => r.message).join("\n"));
		});
	});
});
