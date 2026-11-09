/** Header for database calls this server makes with the public key. No token set means no header, so nothing changes. */
export function gateHeaders(token=process.env.SUPABASE_GATE_TOKEN):Record<string,string>{
 const value=token?.trim();
 return value?{"x-ls-gate":value}:{};
}
