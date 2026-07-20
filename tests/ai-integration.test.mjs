import test from "node:test";
import assert from "node:assert/strict";
import { runStructured,validateStructured } from "../packages/ai/responses.mjs";

test("Responses adapter returns schema-valid safe metadata",async()=>{
 const secret="integration-secret-must-never-leak";let captured;
 const fetchImpl=async(url,options)=>{captured={url,options};return new Response(JSON.stringify({id:"resp_mock_evidence_001",model:"gpt-5.6-sol",status:"completed",output_text:JSON.stringify({targetField:"Secure administrative communications",proposedValue:"Administrative traffic uses mutual TLS 1.3.",sourceFragmentId:"architecture-v2.3:p4:p2",confidence:.94,warnings:[]})}),{status:200,headers:{"Content-Type":"application/json"}})};
 const result=await runStructured({useCase:"evidence",apiKey:secret,model:"gpt-5.6-sol",reasoningEffort:"medium",fetchImpl,input:{sourceFragment:{id:"architecture-v2.3:p4:p2",text:"Synthetic source"}}});
 assert.equal(captured.url,"https://api.openai.com/v1/responses");const requestBody=JSON.parse(captured.options.body);assert.equal(requestBody.reasoning.effort,"medium");assert.equal(requestBody.text.format.type,"json_schema");assert.equal(requestBody.text.format.strict,true);assert.equal(result.responseId,"resp_mock_evidence_001");assert.equal(result.model,"gpt-5.6-sol");assert.equal(result.responseStatus,"completed");assert.equal(result.status,"SUGGESTED");assert.equal(validateStructured("evidence",result.output),true);assert.equal(result.output.sourceFragmentId,"architecture-v2.3:p4:p2");assert.equal(JSON.stringify(result).includes(secret),false);
});

test("schema validator rejects unknown fields",()=>{assert.equal(validateStructured("evidence",{targetField:"x",proposedValue:"y",sourceFragmentId:"known",confidence:.5,warnings:[],authorization:"secret"}),false)});
