// Local-only password bootstrap. Password arrives through stdin, never argv or a file.
import {createClient} from '@supabase/supabase-js';
import {writeFile} from 'node:fs/promises';
process.loadEnvFile('.env.local');
const allowed=['ysyh1730@naver.com','hjdh59@gmail.com'];
const completed=[];
try {
 let input='';for await(const chunk of process.stdin)input+=chunk;
 const payload=JSON.parse(input);input='';
 if(typeof payload.password!=='string'||payload.password.length<8)throw Error('password_length');
 const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SECRET_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
 const permissions=await db.from('lineestate_admins').select('email').in('email',allowed).eq('enabled',true);
 if(permissions.error||permissions.data.length!==allowed.length)throw Error('admin_permission');
 const users=[];for(let page=1;page<=100;page++){const result=await db.auth.admin.listUsers({page,perPage:100});if(result.error)throw Error('lookup_failed');users.push(...result.data.users);if(result.data.users.length<100)break;}
 for(const email of allowed){
  const existing=users.find(u=>u.email?.toLowerCase()===email);
  const result=existing?await db.auth.admin.updateUserById(existing.id,{password:payload.password,email_confirm:true}):await db.auth.admin.createUser({email,password:payload.password,email_confirm:true});
  if(result.error)throw Error(result.error.code==='weak_password'?'weak_password':'update_failed');
  const check=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
  const login=await check.auth.signInWithPassword({email,password:payload.password});
  if(login.error)throw Error('login_failed');
  const access=await check.from('lineestate_admins').select('email').eq('enabled',true).maybeSingle();
  await check.auth.signOut({scope:'local'});
  if(access.error||access.data?.email!==email)throw Error('verification_failed');
  completed.push(email);
 }
 payload.password='';
 const result={success:true,completed};
 await writeFile('.tmp/admin-password-setup-status.json',JSON.stringify(result));
 console.log(JSON.stringify(result));
}catch(error){
 const reason=['password_length','admin_permission','lookup_failed','weak_password','update_failed','login_failed','verification_failed'].includes(error.message)?error.message:'setup_failed';
 const result={success:false,completed,reason};
 await writeFile('.tmp/admin-password-setup-status.json',JSON.stringify(result));console.log(JSON.stringify(result));process.exitCode=1;
}
