'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {validateBindings,CONDITION,SA}=require('../scripts/lchGoogleIamAudit.cjs');
const member='serviceAccount:'+SA;
const grant=(role='roles/datastore.user',condition=CONDITION)=>({role,members:[member],...(condition===null?{}:{condition:{title:'LCH_named_db_only',expression:condition}})});
test('GH29: exact named database IAM conditional role is authorized',()=>{
 const result=validateBindings({bindings:[grant()]});
 assert.equal(result.expectedProjectBindingOnly,true);
 assert.equal(result.prohibitedUnconditionalGrants,0);
 assert.equal(result.conditionalBindingCount,1);
});
test('GH29: reject unconditional or project-wide role',()=>{
 for(const role of ['roles/datastore.user','roles/editor','roles/owner']){
  const result=validateBindings({bindings:[grant(role,null)]});
  assert.equal(result.expectedProjectBindingOnly,false);
  assert.equal(result.prohibitedUnconditionalGrants,1);
 }
});
test('GH29: reject conditional grant for another database',()=>{
 assert.equal(validateBindings({bindings:[grant('roles/datastore.user','resource.name=="projects/other/databases/(default)"')]}).expectedProjectBindingOnly,false);
});
test('GH29: reject additional unexpected grants even when expected one exists',()=>{
 assert.equal(validateBindings({bindings:[grant(),grant('roles/viewer',null)]}).expectedProjectBindingOnly,false);
});
test('GH29: unrelated principals do not satisfy expected SA binding',()=>{
 const unrelated={role:'roles/datastore.user',members:['serviceAccount:other@other.iam.gserviceaccount.com'],condition:{expression:CONDITION}};
 assert.equal(validateBindings({bindings:[unrelated]}).expectedProjectBindingOnly,false);
});
