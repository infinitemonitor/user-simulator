//configuration:
const LEARNS_FROM = ["usersim","💬general","general","chat"] //channels the bot learns from but doesnt talk in
const TALKS_IN = ["usersim"] //channels the bot will talk to people in
const TOKEN = null //the token of your bot
//end configuration

const discord = require("discord.js")
const bot = new discord.Client({disableEveryone: true})
const fs = require("fs")

if(!fs.readdirSync("./").includes("db.json")) {
		fs.writeFileSync("./db.json", "{}")
		console.log("Database does not exist, so a new file was created")
}
let db = require("./db.json") //get the database (or make a new file if it does not exist)
keys = Object.keys(db) //turn the db into an array to perform array operations on it

function think(filter, strict) {
	if(filter) {
		if(filter.includes("@")) return "nice try sucker" //no ping
		filteredkeys = keys.filter(k => k.includes(filter)) //filter db keys
		if(filteredkeys.length == 0 && strict == true) return `No matches for ${filter}` //return if no matches and in strict mode
		if(filteredkeys.length < 2 && strict == false) filteredkeys = keys //reset keys if no matches and not in strict mode
		
		return filteredkeys[Math.round(filteredkeys.length*Math.random())]||filteredkeys[0] //return whatever the bot thought of
	}
	return filteredkeys[Math.round(filteredkeys.length*Math.random())]||filteredkeys[0]
}

bot.on("ready", async () => {
	
		console.log("Ready")
		let link = await bot.generateInvite(["SEND_MESSAGES"])
		console.log(link)
		
		console.log(`[${bot.guilds.cache.size}] ${bot.guilds.cache.map(g => g.name).join(", ")}`)
		
		bot.user.setPresence({ activity: { name: "/help" }})
		
}) //do all of this when ready

bot.on("message", async message => {
	if(message.author.bot) return;
	
	if(!LEARNS_FROM.includes(message.channel.name) & message.channel.type !== "dm") return;
	if(message.content.startsWith(".")) return;
	if(message.content.includes("@")) return; //avoiding mass ping disasters
	
	console.log(`[${message.guild.name}] ${message.author.tag} > ${message.cleanContent}`)
	
	if(!keys.includes(message.cleanContent) && message.content.length > 0 && LEARNS_FROM.includes(message.channel.name) && !message.content.includes("discord.gg")) {
		
			db[message.cleanContent] = {
					author: message.author.tag,
					authorId: message.author.id
			} //make a db entry
			
			await fs.writeFile("./db.json", JSON.stringify(db, null, 4), err => {
				if(err) throw err;
			}) //ctrl+s
			
			keys = Object.keys(db)
	} //if the message isnt in the database and is in a channel that the bot can learn from, add it
	
	if(!TALKS_IN.includes(message.channel.name)) return;
	
	m = think(message.content.split(" ")[0], false) //run think() with the first word of the message
	
	try {
		await message.channel.send(m) //send le message
		console.log(`[${message.guild.name}] > ${m}`)
	} catch(e) {
		message.reply("Something went wrong, try again") //if something goes horribly wrong
	}
	
})

if(!TOKEN || typeof TOKEN !== "string") return console.log("Token is invalid! Check the TOKEN variable in the bot code and type 'rs' when done.")
bot.login(TOKEN); //log in with the token