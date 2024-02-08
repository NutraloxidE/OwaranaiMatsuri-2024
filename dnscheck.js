const dns = require('dns');
const resolver = new dns.Resolver();

resolver.setServers(['8.8.8.8']);

resolver.resolve4('r1ce.farm', (err, addresses) => {
  if (err) throw err;
  console.log(`Addresses: ${JSON.stringify(addresses)}`);
});