import { z } from 'zod';

export const algorithmIds = ['fcfs','sstf','scan','cscan','look','clook'] as const;
export type AlgorithmId = typeof algorithmIds[number];
export type Direction = 'left' | 'right';
export type EventType = 'service' | 'boundary' | 'wraparound';
export interface Config { min: number; max: number; head: number; queue: number[]; direction: Direction }
export interface TraceEvent { from: number; to: number; distance: number; type: EventType; requestIds: number[]; directionBefore: Direction; directionAfter: Direction; cumulative: number }
export interface ExecutionTrace { algorithm: AlgorithmId; config: Config; start: number; events: TraceEvent[]; serviceOrder: number[]; totalMovement: number; wraparoundDistance: number }
export const configSchema = z.object({ min: z.number().int(), max: z.number().int(), head: z.number().int(), queue: z.array(z.number().int()), direction: z.enum(['left','right']) }).superRefine((v,ctx)=>{
  if(v.min>=v.max) ctx.addIssue({code:'custom',path:['max'],message:'Maximum must be greater than minimum.'});
  if(v.head<v.min||v.head>v.max) ctx.addIssue({code:'custom',path:['head'],message:`Head must be between ${v.min} and ${v.max}.`});
  v.queue.forEach((n,i)=>{if(n<v.min||n>v.max)ctx.addIssue({code:'custom',path:['queue',i],message:`Cylinder ${n} is outside ${v.min}–${v.max}.`})});
});
export const DEFAULT_CONFIG: Config = { min:0,max:199,head:53,queue:[98,183,37,122,14,124,65,67],direction:'right' };
export const PRESETS = [
  {name:'Classic mixed queue (default)',head:53,queue:[98,183,37,122,14,124,65,67],direction:'right' as const},
  {name:'Clustered requests',head:50,queue:[47,49,51,52,55,56],direction:'right' as const},
  {name:'Boundary stress',head:98,queue:[2,7,190,195,199,0],direction:'right' as const},
  {name:'Duplicate-cylinder test',head:50,queue:[45,65,65,65,35,35,80],direction:'right' as const},
];
export const ALGORITHMS: {id:AlgorithmId;name:string;short:string;description:string}[] = [
  {id:'fcfs',name:'FCFS',short:'First Come, First Served',description:'Serve requests in arrival order. Simple and fair to the queue, even when that means long seeks.'},
  {id:'sstf',name:'SSTF',short:'Shortest Seek Time First',description:'Choose the nearest pending request. Short local moves can leave distant requests waiting.'},
  {id:'scan',name:'SCAN',short:'Elevator',description:'Sweep in one direction to the physical edge, reverse, then serve the remaining requests.'},
  {id:'cscan',name:'C-SCAN',short:'Circular SCAN',description:'Sweep one way, travel to the edge, then wrap to the other edge and continue.'},
  {id:'look',name:'LOOK',short:'LOOK',description:'Like SCAN, but reverse at the last request instead of visiting an unused edge.'},
  {id:'clook',name:'C-LOOK',short:'Circular LOOK',description:'Like C-SCAN, but wrap between the outermost requested cylinders.'},
];

export function simulate(algorithm:AlgorithmId, input:Config):ExecutionTrace {
  const parsed=configSchema.parse(input); const config:Config={...parsed,queue:[...parsed.queue]};
  const events:TraceEvent[]=[]; const serviceOrder:number[]=[]; let pos=config.head,total=0,wrap=0,dir=config.direction;
  const pending=config.queue.map((c,id)=>({c,id}));
  const move=(to:number,type:EventType,ids:number[]=[],after:Direction=dir)=>{
    const from=pos,distance=Math.abs(to-from); total+=distance; if(type==='wraparound')wrap+=distance;
    events.push({from,to,distance,type,requestIds:ids,directionBefore:dir,directionAfter:after,cumulative:total}); pos=to;dir=after;
    ids.forEach(id=>{const i=pending.findIndex(x=>x.id===id);if(i>=0)pending.splice(i,1);serviceOrder.push(config.queue[id]!) });
  };
  const idsAt=(c:number)=>pending.filter(x=>x.c===c).sort((a,b)=>a.id-b.id).map(x=>x.id);
  const service=(c:number)=>move(c,'service',idsAt(c));
  if(algorithm==='fcfs') { for(let i=0;i<config.queue.length;i++) service(config.queue[i]!); }
  else if(algorithm==='sstf') { while(pending.length){const pick=[...pending].sort((a,b)=>Math.abs(a.c-pos)-Math.abs(b.c-pos)||a.c-b.c||a.id-b.id)[0]!; service(pick.c);} }
  else {
    const side=(d:Direction)=>pending.filter(x=>d==='right'?x.c>=pos:x.c<=pos).map(x=>x.c).sort((a,b)=>d==='right'?a-b:b-a);
    const other=(d:Direction)=>pending.filter(x=>d==='right'?x.c<pos:x.c>pos).map(x=>x.c).sort((a,b)=>d==='right'?b-a:a-b);
    const visitAll=(xs:number[])=>{for(const c of [...new Set(xs)])service(c)};
    const first=side(dir),rest=other(dir);
    visitAll(first);
    if(rest.length){
      if(algorithm==='scan'){const edge=dir==='right'?config.max:config.min; move(edge,'boundary'); dir=dir==='right'?'left':'right'; visitAll(side(dir));}
      if(algorithm==='look'){dir=dir==='right'?'left':'right'; visitAll(side(dir));}
      if(algorithm==='cscan'){const edge=dir==='right'?config.max:config.min; move(edge,'boundary'); const opposite=dir==='right'?config.min:config.max; move(opposite,'wraparound',[],dir); visitAll(rest.slice().sort((a,b)=>dir==='right'?a-b:b-a));}
      if(algorithm==='clook'){const target=dir==='right'?Math.min(...rest):Math.max(...rest); move(target,'wraparound',[],dir); visitAll(rest.slice().sort((a,b)=>dir==='right'?a-b:b-a));}
    }
  }
  return {algorithm,config,start:config.head,events,serviceOrder,totalMovement:total,wraparoundDistance:wrap};
}
export function simulateAll(input:Config){return ALGORITHMS.map(a=>simulate(a.id,input));}
