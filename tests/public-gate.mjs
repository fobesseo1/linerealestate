import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createClient} from '@supabase/supabase-js';
import {gateHeaders} from '../lib/content/gate.ts';
import {toPublicCard} from '../lib/content/public-card.ts';

async function sentHeaders(token){
 let seen;
 const db=createClient('https://example.supabase.co','public-key',{auth:{persistSession:false,autoRefreshToken:false},global:{headers:gateHeaders(token),fetch:async(_,init)=>{seen=new Headers(init.headers);return Response.json([]);}}});
 await db.from('lineestate_published').select('*');
 return seen;
}
test('adds the gate header when a token is set',async()=>{assert.equal((await sentHeaders('test-value')).get('x-ls-gate'),'test-value');});
test('sends no gate header without a token',async()=>{for(const token of [undefined,'','  '])assert.equal((await sentHeaders(token)).has('x-ls-gate'),false);});

const item=(content)=>({id:'a',number:'SUN-1',status:'active',published_at:'2026-11-09',revision_id:'private',content:{kind:'lease',title:'점포',description:'설명',industry:'카페',floor:'1층',area:'33',deposit:'1',rent:'2',salePrice:'',premium:'0',locality:'산본동',showMap:false,management:'5',latitude:37,photos:[{path:'a/1.webp',label:'전경',url:'https://x/1.webp',originalPath:'private'},{path:'a/2.webp',label:'내부',url:'https://x/2.webp'}],...content}});
test('card keeps listed fields and drops the rest',()=>{const card=toPublicCard(item());assert.equal(card.revision_id,undefined);assert.equal(card.content.title,'점포');assert.equal(card.content.management,undefined);assert.equal(card.content.latitude,undefined);assert.deepEqual(card.content.photos,[{path:'a/1.webp',label:'전경',url:'https://x/1.webp'}]);});
test('card shows an address only when the map is public',()=>{assert.equal(toPublicCard(item({address:'비공개'})).content.address,undefined);assert.equal(toPublicCard(item({address:'공개',showMap:true})).content.address,'공개');});
