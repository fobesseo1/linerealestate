import {writeFile} from 'node:fs/promises';
process.loadEnvFile('.env.local');
const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if(!url||!key||!key.startsWith('sb_publishable_'))throw Error('Public Supabase settings unavailable');
await writeFile('lib/content/public-config.json',JSON.stringify({url,publishableKey:key},null,2)+'\n');
console.log('Public client configuration saved; no secret keys included');
