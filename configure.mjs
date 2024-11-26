import * as fs from "fs";
import * as crypto from "crypto";

const error = (msg) => {
    console.error(msg);
    process.exit(-1);
};

const processFeatureSections = (content, features) => {
    for (const [featureName, enabled] of Object.entries(features)) {
        const startMarker = `__feature_${featureName}__start__`;
        const endMarker = `__feature_${featureName}__end__`;

        const lines = content.split('\n');
        const processedLines = [];

        let insideFeatureSection = false;

        for (const line of lines) {
            if (line.includes(startMarker)) {
                insideFeatureSection = true;
            } else if (line.includes(endMarker)) {
                insideFeatureSection = false;
            } else if (!insideFeatureSection || enabled) {
                processedLines.push(line);
            }
        }
        content = processedLines.join('\n');
    }
    return content;
};

const replaceInFile = (map, filePath, features) => {
    console.log("Replacing placeholders in " + filePath);
    let content = fs.readFileSync(filePath, "utf8");

    if (features) {
        content = processFeatureSections(content, features);
    }

    for (const [key, value] of map.entries()) {
        const regex = new RegExp(key, "g");
        content = content.replace(regex, value);
    }

    fs.writeFileSync(filePath, content, "utf8");
};

const generateSecurePassword = (length = 32) => {
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let password = "";
    while (password.length < length) {
        const byte = crypto.randomBytes(1);
        const idx = byte[0] % charset.length;
        password += charset.charAt(idx);
    }
    return password;
};

const isRootDomain = (domain) => {
    const parts = domain.split('.');
    return parts.length <= 1;
};

const getHostList = (domain, nginx) => {
    if (isRootDomain(domain)) {
        return nginx ? `${domain},www.${domain}` : `${domain} www.${domain}`;
    } else {
        return domain;
    }
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

const features = {
    db: pkg.app.needsDb ?? true,
};

const dbName = pkg.app.name.toUpperCase() + "_DB";
const dbUser = pkg.app.name.toUpperCase() + "_DB_USER";
const dbPassword = pkg.app.name.toUpperCase() + "_DB_PASSWORD";
const secrets = `export ${dbName}=$${dbName} && export ${dbUser}=$${dbUser} && export ${dbPassword}=$${dbPassword}`;

const replacements = new Map([
    ["__app_name__", pkg.app.name],
    ["__app_description__", pkg.app.description],
    ["__app_host__", pkg.app.host],
    ["__app_host_dir__", pkg.app.hostDir],
    ["__app_server_port__", pkg.app.serverPort],
    ["__app_domain__", pkg.app.domain],
    ["__app_host_list__", getHostList(pkg.app.domain, false)],
    ["__app_host_list_nginx__", getHostList(pkg.app.domain, true)],
    ["__app_email__", pkg.app.email],
    ["__app_secrets__", secrets],
    ["__app_db_name__", "${" + dbName + "}"],
    ["__app_db_user__", "${" + dbUser + "}"],
    ["__app_db_password__", "${" + dbPassword + "}"],
]);

console.log("Features enabled:", features);
console.log("Replacements:", replacements);

const filesToProcess = [
    "package.json",
    "publish.sh",
    "stats.sh",
    "docker/docker-compose.base.yml",
    "docker/docker-compose.prod.yml",
    "docker/nginx.conf",
    "docker/control.sh",
    "html/index.html",
    "html/manifest.json",
];

filesToProcess.forEach(file => {
    replaceInFile(replacements, file, features);
});

if (features.db) {
    console.log("ATTENTION!");
    console.log("Please add the following environment variables to your environment");
    console.log();
    console.log(`echo '' >> ~/.zshrc`);
    console.log(`echo '' >> ~/.zshrc`);
    console.log(`echo 'export ${dbName}="${dbName.toLowerCase()}"' >> ~/.zshrc`);
    console.log(`echo 'export ${dbUser}="${dbUser.toLowerCase()}"' >> ~/.zshrc`);
    console.log(`echo 'export ${dbPassword}="${generateSecurePassword()}"' >> ~/.zshrc`);
    console.log(`source ~/.zshrc`);
}