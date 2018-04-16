#!/usr/bin/env node
const program = require('commander');
const fs = require('fs');
const publicIp = require('public-ip');
const colors = require('colors');
const axios = require('axios');


program
.version(JSON.parse(fs.readFileSync('./package.json')).version, '-v, --version')
.usage('<command> <options>');
// Required if no env variables
program
.option('--identifier <identifier>', 'Cloudflare Load Balancer Identifier')
.option('--api-key <api>', 'Cloudflare API Key')
.option('--email <email>', 'Cloudflare Email Address');
// Not required
program
.option('--origin-name <name>', 'Origin Name')
.option('--origin-weight <weight>', 'Origin Weight');
// Not required
program
.option('--no-color', 'Disable colors from output');


program
.command('register');
program
.command('deregister');

program
.action(async (cmd, options) => {
	console.log("\nStep 1: Setting up environment");
	cmd = cmd.toLowerCase();
	if (cmd !== "register" && cmd !== "deregister") {
		console.log(`✖ Invalid Command: ${cmd}`.red);
		return process.exit(1);
	} else {
		console.log(`✔ Set Command: ${cmd}`.green);
	}
	const apiKey = options.apiKey;
	const email = options.email;
	const identifier = options.identifier;
	console.log(!apiKey ? `✖ No API key specified`.red : `✔ Set API key: ${apiKey}`.green);
	console.log(!email ? `✖ No email specified`.red : `✔ Set Email: ${email}`.green);
	console.log(!identifier ? `✖ No identifier specified`.red : `✔ Set Identifer: ${identifier}`.green);
	if (!apiKey || !email || !identifier) {
		return process.exit(1);
	}
	
	console.log("\nStep 2: Getting IP address");
	let ipAddress;
	try {
		ipAddress = await getIPAddress();
		console.log(`✔ Got IP address: ${ipAddress}`.green);
	} catch (e) {
		console.log(`✖ Error getting IP address`.red);
		showError(e);
		return process.exit(1);
	}
	
	console.log("\nStep 3: Getting Cloudflare pool details");
	let poolDetails;
	let originExistsInPool;
	try {
		const axiosData = await axios.get(`https://api.cloudflare.com/client/v4/user/load_balancers/pools/${identifier}`, {
			headers: {
				"X-Auth-Email": email,
				"X-Auth-Key": apiKey,
				"Content-Type": "application/json"
			}
		});
		console.log(`✔ Got Cloudflare pool details`.green);
		poolDetails = axiosData.data;

		if (poolDetails.origins.some(origin => origin.address === ipAddress)) {
			console.log(`✔ Found correct origin within pool`.green);
			originExistsInPool = true;
		} else {
			console.log(`* Could not find correct origin within pool`.yellow);
			originExistsInPool = false;
		}
	} catch (e) {
		console.log(`✖ Error getting Cloudflare pool details`.red);
		showError(`Status Code\n${e.response.status}\n\nData\n${JSON.stringify(e.response.data, null, 4)}`);
		return process.exit(1);
	}
	
	console.log(`\nStep 4: ${capitalizeFirstLetter(cmd)}ing instance in Cloudflare pool`);
	let updatedPoolOrigins = [...poolDetails.origins];
	if (!originExistsInPool) {
		console.log(`➜ Adding instance to pool`.gray);
		updatedPoolOrigins.push({
			name: options.originName || ipAddress.replace(/\./g, "_"),
			address: ipAddress,
			enabled: cmd === "register",
			weight: 1.0
		});
	} else {
		console.log(`➜ Updating pool instances`.gray);
		updatedPoolOrigins = updatedPoolOrigins.map(origin => {
			if (origin.address ===  ipAddress) {
				return {
					...origin,
					enabled: cmd === "register",
				};
			} else {
				return origin;
			}
		});
	}
	try {
		const axiosData = await axios.put(`https://api.cloudflare.com/client/v4/user/load_balancers/pools/${identifier}`, {
			name: poolDetails.name,
			origins: updatedPoolOrigins
		}, {
			headers: {
				"X-Auth-Email": email,
				"X-Auth-Key": apiKey,
				"Content-Type": "application/json"
			}
		});
		console.log(`✔ Successfully updated Cloudflare pool`.green);
	} catch (e) {
		console.log(`✖ Error updating Cloudflare pool`.red);
		showError(`Status Code\n${e.response.status}\n\nData\n${JSON.stringify(e.response.data, null, 4)}`);
		return process.exit(1);
	}
});

program
.parse(process.argv);

function getIPAddress() {
	return publicIp.v4();
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function showError(err) {
	console.log("\n\n\n\n\n\n");
	console.error("Error: ");
	console.error(err);
}
