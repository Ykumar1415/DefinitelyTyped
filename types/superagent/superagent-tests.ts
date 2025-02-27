// via: http://visionmedia.github.io/superagent/
import request = require("superagent");
import * as fs from "fs";
import assert = require("assert");
import { Blob } from "buffer";
import { Agent } from "https";

// Examples taken from https://github.com/visionmedia/superagent/blob/gh-pages/docs/index.md
// and https://github.com/visionmedia/superagent/blob/master/Readme.md

const httpsAgent: Agent = new Agent();

request
    .post("/api/pet")
    .send({ name: "Manny", species: "cat" })
    .set("X-API-Key", "foobar")
    .set("Accept", "application/json")
    .agent(httpsAgent)
    .end((err, res) => {
        if (res.ok) {
            console.log("yay got " + JSON.stringify(res.body));
        } else {
            console.log("Oh no! error " + res.text);
        }
    });

const agent = request.agent();
agent
    .post("/api/pet")
    .send({ name: "Manny", species: "cat" })
    .set("X-API-Key", "foobar")
    .set("Accept", "application/json")
    .end((err, res) => {
        if (res.error) {
            console.log("oh no " + res.error.message);
        } else {
            console.log(`got ${res.status} response`);
        }
    });

const callback = (err: any, res: request.Response) => {};

// Request basics
request.get("/search").end(callback);

request("GET", "/search").end(callback);

request.get("http://example.com/search").end(callback);

request.head("/favicon.ico").end(callback);

request.del("/user/1").end(callback);

request.delete("/user/1").end(callback);

request.delete("/user/1").send().end(callback);

request("/search").end(callback);

// Setting header fields
request.get("/search").set("API-Key", "foobar").set("Accept", "application/json").end(callback);

request.get("/search").set({ "API-Key": "foobar", Accept: "application/json" }).end(callback);

// Setting cookie header
request
    .get("/search")
    .set("Cookie", ["name1=value1; Domain=.test.com; Path=/", "name2=value2; Domain=.test.com; Path=/"])
    .end(callback);

// GET requests
request.get("/search").query({ query: "Manny" }).query({ range: "1..5" }).query({ order: "desc" }).end(callback);

request.get("/search").query({ query: "Manny", range: "1..5", order: "desc" }).end(callback);

request.get("/querystring").query("search=Manny&range=1..5").end(callback);

request.get("/querystring").query("search=Manny").query("range=1..5").end(callback);

// HEAD requests
request.head("/users").query({ email: "joe@smith.com" }).end(callback);

// POST / PUT requests
request.post("/user").set("Content-Type", "application/json").send("{\"name\":\"tj\",\"pet\":\"tobi\"}").end(callback);

request.post("/user").send({ name: "tj", pet: "tobi" }).end(callback);

request.post("/user").send({ name: "tj" }).send({ pet: "tobi" }).end(callback);

request.post("/user").send("name=tj").send("pet=tobi").end(callback);

request.post("/user").type("form").send({ name: "tj" }).send({ pet: "tobi" }).end(callback);

// Setting the Content-Type
request.post("/user").set("Content-Type", "application/json");

request.post("/user").type("application/json");

request.post("/user").type("json");

request.post("/user").type("png");

// Setting Accept
request.get("/user").accept("application/json");

request.get("/user").accept("json");

request.get("/user").accept("png");

// Setting max response size
request.get("/search").maxResponseSize(1000).end(callback);

// Query strings
request
    .post("/")
    .query({ format: "json" })
    .query({ dest: "/login" })
    .send({ post: "data", here: "wahoo" })
    .end(callback);

// Custom request serializer
function testParser(data: any) {
    return JSON.stringify(data);
}

request.post("/user").serialize(testParser).type("json").send({ foo: 123 }).end(callback);

// Default serialization map

request.serialize["application/xml"] = (obj: any) => "generated xml here";

// Parsing response bodies
request("/search").end((res: request.Response) => {
    const status: number = res.status;
    const body = res.body;
    const files: object = res.files;
    const text: string = res.text;
    const contentLength = res.header["content-length"];
    assert(res.header === res.headers);
    const contentType: string = res.type;
    const charset: string = res.charset;
    const redirects: string[] = res.redirects;
});

// Getting response 'Set-Cookie'
request("/search").end((res: request.Response) => {
    const setCookie: string[] = res.get("Set-Cookie");
});

// Custom parsers
request
    .post("/search")
    .parse((res, callback) => {
        res.setEncoding("binary");
        let data = "";
        res.on("data", (chunk: string) => {
            data += chunk;
        });

        res.on("end", () => {
            callback(null, new Buffer(data, "base64"));
        });
    })
    .end((res: request.Response) => {
        res.body.toString("hex");
    });

const req = request.get("/hoge");
// Aborting requests
req.abort();

// Request timeouts
req.timeout(100);
req.timeout({ response: 5000, deadline: 60000 });

const reqUrl: string = req.url;
const reqMethod: string = req.method;
const reqCookies: string = req.cookies;

console.log(`${reqMethod} request to ${reqUrl} cookies ${reqCookies}`);

// Authentication
request.get("http://tobi:learnboost@local").end(callback);

request.get("http://local").auth("tobo", "learnboost").end(callback);

request.get("http://local").auth("user", "pass", { type: "basic" }).end(callback);

request.get("http://local").auth("user", "pass", { type: "auto" }).end(callback);

request.get("http://local").auth("abearertoken", { type: "bearer" }).end(callback);

// Following redirects
request.get("/some.png").redirects(2).end(callback);

// Retries, from https://github.com/visionmedia/superagent/commit/765de565c505abd221e7aa0765c5dd883a987ef1
request.get("/some.png").retry().timeout({ response: 9000, deadline: 10000 });
request.get("http://example.com/search").retry(2).end(callback);
request.get("http://example.com/search").retry(2, callback).end(callback);

(() => {
    const stream = fs.createWriteStream("path/to/my.json");
    const req = request.get("/some.json");
    req.pipe(stream);
})();

// Attaching files
const blob = new Blob([]);
request
    .post("/upload")
    .attach("avatar", "path/to/tobi.png", "user.png")
    .attach("image", "path/to/loki.png")
    .attach("file", "path/to/jane.png")
    .attach("fileWithOptions", "path/to/file.png", { filename: "filename", contentType: "contentType" })
    .attach("blob", blob)
    .end(callback);

// Field values
request
    .post("/upload")
    .field("user[name]", "Tobi")
    .field("user[email]", "tobi@learnboost.com")
    .field({
        field1: "value1",
        field2: Buffer.from([10, 20]),
        field3: ["value1", "value2"],
        field4: true,
    })
    .attach("image", "path/to/tobi.png")
    .end(callback);

// CORS
request.get("http://localhost:4001/").withCredentials().end(callback);

// Error handling
request
    .post("/upload")
    .attach("image", "path/to/tobi.png")
    .end((err: any, res: request.Response): void => {});
request
    .post("/upload")
    .attach("image", "path/to/tobi.png")
    .on("error", (err: any) => {})
    .end(callback);

// Progress
request
    .post("/upload")
    .attach("image", "path/to/tobi.png")
    .on("progress", (progress: request.ProgressEvent) => {
        if (progress.direction === "download") {
        } else if (progress.direction === "upload") {
        }
        const loaded: number = progress.loaded;
        const percent: number | undefined = progress.percent;
        const total: number | undefined = progress.total;
    })
    .end(callback);

// DNS override (tests based on documentation examples)
request.get("http://example.com").connect("127.0.0.1").end(callback);

request.get("http://redir.example.com:555")
    .connect({
        "redir.example.com": "127.0.0.1", // redir.example.com:555 will use 127.0.0.1:555
        "www.example.com": false, // don't override this one; use DNS as normal
        "mapped.example.com": { host: "127.0.0.1", port: 8080 }, // mapped.example.com:* will use 127.0.0.1:8080
        "*": "proxy.example.com", // all other requests will go to this host
    }).end(callback);

// Promise
request
    .get("/search")
    .then(response => {})
    .catch(error => {});
// Requesting binary data.
// adapted from: https://github.com/visionmedia/superagent/blob/v2.0.0/test/client/request.js#L110
request
    .get("/blob")
    .responseType("blob")
    .end((err, res) => {
        res.xhr; // $ExpectType any
        res.xhr.response; // $ExpectType any
    });

// HTTPS request, from: https://github.com/visionmedia/superagent/commit/6158efbf42cb93d77c1a70887284be783dd7dabe
const ca = fs.readFileSync("ca.cert.pem");
const key = fs.readFileSync("key.pem");
const cert = fs.readFileSync("cert.pem");
request.post("/secure").ca(ca).key(key).cert(cert).end(callback);

const pfx = fs.readFileSync("cert.pfx");
request.post("/secure").pfx(pfx).end(callback);

// pfx with passphrase, from: https://github.com/visionmedia/superagent/pull/1230/commits/96af65ffc6256df633f893095d1dc828694bbfbc
const passpfx = fs.readFileSync("passcert.pfx");
request
    .post("/secure")
    .pfx({
        pfx: passpfx,
        passphrase: "test",
    })
    .end(callback);

// HTTPS request with string, Buffer, and arrays of strings and Buffers, from: https://nodejs.org/api/tls.html#tls_tls_createsecurecontext_options
request.post("/secure").ca("ca").key("key").cert("cert").end(callback);

request.post("/secure").ca(["ca"]).key(["key"]).cert(["cert"]).end(callback);

request.post("/secure").ca([ca]).key([key]).cert([cert]).end(callback);

request.post("/secure").pfx("cert.pfx").end(callback);

request.post("/secure").pfx(["cert.pfx"]).end(callback);

request.post("/secure").pfx([pfx]).end(callback);

// 'response' event, adapted from: https://visionmedia.github.io/superagent/docs/test.html
request
    .get("/user/1")
    .on("response", res => {
        try {
            assert.equal("bar", res.body.foo);
        } catch (e) {
            /* ignore */
        }
    })
    .end();

// ok, from: https://github.com/visionmedia/superagent/commit/34533bbc29833889090847c45a82b0ea81b2f06d
request
    .get("/404")
    .ok(res => res.statusCode < 500)
    .then(response => {
        // reads 404 page as a successful response
    });

// Test that the "Plugin" type from "use" provides a SuperAgentRequest rather than a Request,
// which has additional properties.
const echoPlugin = (request: request.SuperAgentRequest) => {
    req.url = "" + req.url;
    req.cookies = "" + req.cookies;
    if (req.method) {
        req.url = "/echo";
    }
};

request.get("/echo").use(echoPlugin).end();

async function testDefaultOptions() {
    // Default options for multiple requests
    const agentWithDefaultOptions = new request
        .agent()
        .use(() => null)
        .auth("digest", "secret", { type: "auto" });

    await agentWithDefaultOptions.get("/with-plugin-and-auth");
    await agentWithDefaultOptions.get("/also-with-plugin-and-auth");
}

request.get("/").http2().end(callback);
request("POST", "/").http2().end(callback);
agent.get("/").http2().end(callback);

void testDefaultOptions();
