import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateInquiry} from '../lib/inquiries/validation.ts';
const valid=()=>({requestId:crypto.randomUUID(),kind:'listing',reference:'SUN-1004',title:'점포',goal:'상가 매수 검토',phone:'010-1234-5678',industry:'',message:'',time:'',consent:true});
test('normalizes contact number and permits empty optional fields',()=>{const result=validateInquiry(valid());assert.equal(result.phone,'01012345678');assert.equal(result.message,'');});
test('rejects missing consent, malformed number, and false listing references',()=>{assert.throws(()=>validateInquiry({...valid(),consent:false}));assert.throws(()=>validateInquiry({...valid(),phone:'hello'}));assert.throws(()=>validateInquiry({...valid(),reference:'<script>'}));});
test('rejects nontext data and oversized customer messages',()=>{assert.throws(()=>validateInquiry({...valid(),message:{private:'value'}}));assert.throws(()=>validateInquiry({...valid(),message:'x'.repeat(1001)}));});
test('requires valid idempotency identifier and supported inquiry category',()=>{assert.throws(()=>validateInquiry({...valid(),requestId:''}));assert.throws(()=>validateInquiry({...valid(),kind:'arbitrary'}));});
