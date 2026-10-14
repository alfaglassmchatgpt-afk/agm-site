const copy=value=>structuredClone(value);
const opposite=side=>side==='left'?'right':'left';
export class FacadeProject {
 constructor(defaults){this.defaults=copy(defaults);this.items=[];this.nextId=1;this.activeId=null;this.add('new');}
 current(){return this.items.find(item=>item.id===this.activeId);}
 partner(){const item=this.current();return item?.pairId?this.items.find(other=>other.id!==item.id&&other.pairId===item.pairId):undefined;}
 update(config){const item=this.current();item.config=copy(config);const other=this.partner();if(other)other.config={...copy(config),side:opposite(config.side)};}
 add(kind){const source=this.current();if(kind==='mirror'&&this.partner())throw new Error('Фасад уже связан с парой');
 const id=`facade-${this.nextId++}`, config=copy(kind==='new'?this.defaults:source.config);
 const item={id,name:kind==='new'?`Фасад ${this.items.length+1}`:source.name+(kind==='mirror'?' — пара':' — копия'),pairId:null,config};
 if(kind==='mirror'){item.config.side=opposite(config.side);source.pairId=item.pairId=source.id;}
 this.items.push(item);this.activeId=id;return item;
 }
}
