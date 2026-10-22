export class ProjectConfirmation {
 constructor(){this.signature=null;}
 fingerprint(items){return JSON.stringify(items.map(({id,name,pairId,config})=>{const {view,backdrop,origin,...parameters}=config;return {id,name,pairId,parameters};}));}
 check(items,valid){if(!valid||this.signature!==this.fingerprint(items))this.signature=null;return this.signature!==null;}
 confirm(items,valid){this.signature=valid?this.fingerprint(items):null;return valid;}
}
