'use strict';
// GH-29: read-only Google IAM policy audit. Never exports OAuth tokens, private keys or PII.
const PROJECT='rag-municipalidades';
const DATABASE='ai-studio-8963e7a3-87ce-4ca9-938c-9490f698d4c7';
const SA='lch-lead-mail-n8n@'+PROJECT+'.iam.gserviceaccount.com';
const CONDITION='resource.name=="projects/'+PROJECT+'/databases/'+DATABASE+'"';
function validateBindings(policy){
 const bindings=(policy?.bindings||[]).filter(b=>(b.members||[]).includes('serviceAccount:'+SA));
 const exclusive=bindings.length===1 && bindings[0].role==='roles/datastore.user' && bindings[0].condition?.expression===CONDITION;
 return {account:SA,expectedProjectBindingOnly:exclusive,conditionalBindingCount:bindings.length,prohibitedUnconditionalGrants:bindings.filter(b=>!b.condition?.expression).length};
}
async function liveAudit(){
 const cfg=require('/usr/local/lib/node_modules/firebase-tools/lib/configstore').configstore;
 const login=cfg.get('tokens');if(!login?.refresh_token)throw Error('Firebase CLI authentication missing');
 const o=await require('/usr/local/lib/node_modules/firebase-tools/lib/auth').getAccessToken(login.refresh_token,login.scopes||[]);
 const access=typeof o==='string'?o:o.access_token;
 if(!access)throw Error('Google API access unavailable');
 async function api(path,method='GET',body){const r=await fetch(path,{method,headers:{Authorization:'Bearer '+access,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});const data=await r.json();if(!r.ok)throw Error('Google audit read failed HTTP '+r.status);return data;}
 const resource='https://cloudresourcemanager.googleapis.com/v1/projects/'+PROJECT;
 const policy=await api(resource+':getIamPolicy','POST',{options:{requestedPolicyVersion:3}});
 const role=validateBindings(policy);
 const details=await api('https://iam.googleapis.com/v1/projects/'+PROJECT+'/serviceAccounts/'+SA);
 const keys=await api('https://iam.googleapis.com/v1/projects/'+PROJECT+'/serviceAccounts/'+SA+'/keys?keyTypes=USER_MANAGED');
 const userManagedKeyCount=(keys.keys||[]).length;
 const ready=role.expectedProjectBindingOnly && details.email===SA;
 return {...role,serviceAccountExists:details.email===SA,userManagedKeyCount,iamReady:ready,effectiveFirestoreAccessVerified:false,n8nCredentialVerified:false,mailDeliveryVerified:false};
}
if(require.main===module){
 if(process.argv.includes('--live'))liveAudit().then(result=>{console.log(JSON.stringify(result));if(!result.iamReady)process.exitCode=2;}).catch(()=>{console.error('Unable to validate IAM grant with Firebase CLI session');process.exitCode=2;});
 else {console.error('Use --live with authenticated Firebase CLI; tests import validateBindings without calling Google Cloud');process.exitCode=64;}
}
module.exports={validateBindings,CONDITION,SA};
