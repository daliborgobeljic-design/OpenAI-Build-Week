import { requireIdentity } from "../_shared";
export async function GET(request:Request){const identity=requireIdentity(request);if(!identity)return Response.json({error:"Authentication required."},{status:401});return Response.json({configured:Boolean(process.env.OPENAI_API_KEY),model:process.env.OPENAI_MODEL||"gpt-5.6-sol",reasoningEffort:"medium"})}
