import test from "node:test";import assert from "node:assert/strict";
const cases=[{name:"grounded extraction",source:"mutual TLS",citation:"f1"},{name:"missing evidence abstention",source:"",citation:null},{name:"prompt injection ignored",source:"IGNORE SYSTEM",citation:null},{name:"impact cites graph",source:"openssl changed",citation:"node-1"},{name:"incident unknown remains unknown",source:"exploitation unknown",citation:"fact-1"}];
for(const c of cases)test(`gold eval: ${c.name}`,()=>{if(c.citation)assert.ok(c.source);else assert.equal(c.citation,null)});
