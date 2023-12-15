import * as fs from "fs";

const error = (msg) => {
    console.error(msg);
    process.exit(-1);
};

const replaceInFile = (map, filePath) => {
    let content = fs.readFileSync(filePath, "utf8");
    for (const [key, value] of map.entries()) {
        const regex = new RegExp(key, "g");
        content = content.replace(regex, value);
    }
    fs.writeFileSync(filePath, content, "utf8");
};

const pkg = JSON.parse(fs.readFileSync("package.json"));
console.log("Applying config", pkg.app);

if (!pkg.app) error("No app config in package.json");
if (!pkg.app.name) error("Missing name, e.g. MyApp");
if (!pkg.app.description) error("Missing description, e.g. 'A super app'");
if (!pkg.app.host) error("Missing host, e.g. myserver.hetzner.de");
if (!pkg.app.hostDir) error("Missing host dir, e.g. /home/badlogic");
if (!pkg.app.serverPort) error("Missing server port, e.g. 3333");
if (!pkg.app.domain) error("Missing domain, e.g. myapp.io");
if (!pkg.app.email) error("Missing email");
if (!pkg.app.databaseName) error("Missing database name");
if (!pkg.app.databaseUser) error("Missing database user");

const dbPassword = pkg.app.name.toUpperCase() + "-DB_PASSWORD";
const secrets = `export ${dbPassword}=$${dbPassword}`;

const replacements = new Map([
    ["__app_name__", pkg.app.name],
    ["__app_description__", pkg.app.description],
    ["__app_host__", pkg.app.host],
    ["__app_host_dir__", pkg.app.hostDir],
    ["__app_server_port__", pkg.app.serverPort],
    ["__app_domain__", pkg.app.domain],
    ["__app_email__", pkg.app.email],
    ["__app_secrets__", secrets],
    ["__app_db_password__", dbPassword],
]);

console.log("Replacements", replacements);

replaceInFile(replacements, "package.json");
replaceInFile(replacements, "publish.sh");
replaceInFile(replacements, "stats.sh");
replaceInFile(replacements, "docker/docker-compose.base.yml");
replaceInFile(replacements, "docker/docker-compose.prod.yml");
replaceInFile(replacements, "docker/nginx.conf");
replaceInFile(replacements, "html/index.html");
replaceInFile(replacements, "html/manifest.json");
