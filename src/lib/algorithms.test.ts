import { describe, expect, it } from 'vitest';
import { DEFAULT_CONFIG, simulate, simulateAll } from './algorithms';
describe('canonical disk scheduling regression',()=>{
  it('matches all specified totals',()=>expect(simulateAll(DEFAULT_CONFIG).map(x=>x.totalMovement)).toEqual([640,236,331,382,299,322]));
  it('counts circular movement as a distinct physical event',()=>{
    const cscan=simulate('cscan',DEFAULT_CONFIG),clook=simulate('clook',DEFAULT_CONFIG);
    expect(cscan.events.find(e=>e.type==='wraparound')).toMatchObject({from:199,to:0,distance:199});
    expect(clook.events.find(e=>e.type==='wraparound')).toMatchObject({from:183,to:14,distance:169});
  });
  it('services duplicate requests at the same visit in arrival order',()=>expect(simulate('sstf',{...DEFAULT_CONFIG,head:70,queue:[65,65,35,65]}).serviceOrder).toEqual([65,65,65,35]));
  it('breaks equal SSTF distances toward the lower cylinder',()=>expect(simulate('sstf',{...DEFAULT_CONFIG,head:50,queue:[60,40]}).serviceOrder).toEqual([40,60]));
  it('keeps SCAN boundary travel distinct from service',()=>{
    const trace=simulate('scan',{...DEFAULT_CONFIG,head:100,queue:[199,0]});
    expect(trace.events.map(e=>e.type)).toEqual(['service','boundary','service']);
    expect(trace.events[1]).toMatchObject({from:199,to:199,distance:0,requestIds:[]});
    expect(trace.totalMovement).toBe(298);
  });
  it('accepts empty queues',()=>expect(simulateAll({...DEFAULT_CONFIG,queue:[]}).map(x=>x.totalMovement)).toEqual([0,0,0,0,0,0]));
});
